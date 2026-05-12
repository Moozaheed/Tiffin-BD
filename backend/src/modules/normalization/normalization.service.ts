import { Injectable, Optional } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  RawOrdersRepository,
  NormalizedOrdersRepository,
  NormalizationErrorsRepository,
  SourceConnectorsRepository,
} from '../../database/repositories';
import { RawOrders, NormalizedOrders } from '../../database/entities';
import { LoggerService } from '../../common/logger/logger.service';
import { ConnectorRegistry } from '../ingestion/connectors/connector-registry';
import { IntermediateOrder } from '../ingestion/connectors/interfaces';
import { BranchRoutingService } from './services/branch-routing.service';
import {
  OrderLifecycleStatus,
  RABBITMQ_CONSTANTS,
  RawOrderStatus,
} from '../../common/constants';

@Injectable()
export class NormalizationService {
  private orderCounter = 0;

  constructor(
    @Optional() private readonly amqpConnection: AmqpConnection,
    private readonly rawOrdersRepository: RawOrdersRepository,
    private readonly normalizedOrdersRepository: NormalizedOrdersRepository,
    private readonly normalizationErrorsRepository: NormalizationErrorsRepository,
    private readonly sourceConnectorsRepository: SourceConnectorsRepository,
    private readonly connectorRegistry: ConnectorRegistry,
    private readonly branchRoutingService: BranchRoutingService,
    private readonly logger: LoggerService,
  ) {}

  async enqueueRawOrder(rawOrderId: string): Promise<void> {
    await this.amqpConnection.publish(
      RABBITMQ_CONSTANTS.EXCHANGE,
      RABBITMQ_CONSTANTS.NORMALIZATION_ROUTING_KEY,
      { rawOrderId, attempt: 1 },
      { persistent: true, messageId: rawOrderId },
    );
    this.logger.info(
      `Enqueued raw order ${rawOrderId} for normalization`,
      'NormalizationService',
    );
  }

  async normalizeRawOrder(rawOrderId: string): Promise<NormalizedOrders> {
    const rawOrder = await this.rawOrdersRepository.findOne({
      where: { id: rawOrderId },
      relations: ['sourceConnector'],
    });
    if (!rawOrder) {
      throw new Error(`Raw order ${rawOrderId} not found`);
    }

    await this.rawOrdersRepository.update(rawOrderId, {
      processingStatus: RawOrderStatus.PROCESSING,
    });

    try {
      const sourceConnector = await this.sourceConnectorsRepository.findOne({
        where: { id: rawOrder.sourceConnectorId },
      });
      const sourceType = sourceConnector?.code || rawOrder.sourceConnectorId;

      const connector = this.connectorRegistry.getConnector(sourceType);
      let intermediate: IntermediateOrder;

      if (connector) {
        intermediate = connector.toIntermediateOrder(rawOrder.rawData);
      } else {
        intermediate = this.fallbackIntermediate(rawOrder);
      }

      const routing = await this.branchRoutingService.determineBranch(
        intermediate,
        rawOrder.branchId,
      );

      const canonicalOrderNo = this.generateCanonicalOrderNo(sourceType);

      const normalized = this.normalizedOrdersRepository.create({
        canonicalOrderNo,
        externalOrderId: rawOrder.externalOrderId,
        source: sourceType,
        rawOrderId: rawOrder.id,
        customerId: intermediate.customer?.phone || null,
        customerName: intermediate.customer?.name || null,
        customerPhone: intermediate.customer?.phone || null,
        customerEmail: intermediate.customer?.email || null,
        branchId: routing.branchId,
        deliveryAddress: intermediate.customer?.address || null,
        totalAmount: intermediate.total,
        subtotalAmount: intermediate.subtotal || intermediate.total,
        taxAmount: intermediate.taxAmount || 0,
        deliveryFee: intermediate.deliveryFee || 0,
        discountAmount: intermediate.discountAmount || 0,
        currency: intermediate.currency || 'BDT',
        paymentMethod: intermediate.paymentMethod || null,
        paymentStatus: intermediate.paymentStatus || null,
        items: intermediate.items,
        metadata: {
          ...intermediate.metadata,
          routingStrategy: routing.strategy,
          routingConfidence: routing.confidence,
          rawOrderId: rawOrder.id,
        },
        status: OrderLifecycleStatus.PENDING,
        notes: intermediate.specialInstructions || null,
      });

      const saved = await this.normalizedOrdersRepository.save(normalized);

      await this.rawOrdersRepository.markAsProcessed(rawOrderId);

      this.logger.info(
        `Normalized order ${canonicalOrderNo} from raw ${rawOrderId}`,
        'NormalizationService',
        { normalizedId: saved.id, source: sourceType, branch: routing.branchId },
      );

      return saved;
    } catch (err: any) {
      await this.rawOrdersRepository.markAsFailed(rawOrderId, err.message);
      await this.rawOrdersRepository.incrementRetryCount(rawOrderId);

      await this.normalizationErrorsRepository.save({
        rawOrderId,
        branchId: rawOrder.branchId,
        errorCode: 'NORMALIZATION_FAILED',
        errorMessage: err.message,
        errorDetails: err.stack,
        status: 'unresolved',
      });

      this.logger.error(
        `Failed to normalize raw order ${rawOrderId}`,
        err,
        'NormalizationService',
      );
      throw err;
    }
  }

  async reprocessFailedOrders(limit = 50): Promise<number> {
    const failed = await this.rawOrdersRepository.findByStatus(RawOrderStatus.FAILED, limit);
    let enqueued = 0;
    for (const raw of failed) {
      if (raw.retryCount < RABBITMQ_CONSTANTS.MAX_RETRIES) {
        await this.enqueueRawOrder(raw.id);
        enqueued++;
      }
    }
    this.logger.info(`Re-enqueued ${enqueued} failed orders`, 'NormalizationService');
    return enqueued;
  }

  async getNormalizationErrors(branchId?: string) {
    return this.normalizationErrorsRepository.find({
      where: branchId ? { branchId, status: 'unresolved' } : { status: 'unresolved' },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  private generateCanonicalOrderNo(source: string): string {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = source.substring(0, 3).toUpperCase();
    const seq = String(++this.orderCounter).padStart(5, '0');
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${dateStr}-${seq}-${rand}`;
  }

  private fallbackIntermediate(rawOrder: RawOrders): IntermediateOrder {
    const data = rawOrder.rawData || {};
    return {
      sourceOrderId: rawOrder.externalOrderId,
      customer: {
        name: data.customer_name || data.customer?.name || 'Unknown',
        phone: data.customer_phone || data.customer?.phone || '',
        email: data.customer_email || data.customer?.email,
        address: data.delivery_address || data.customer?.address,
      },
      items: Array.isArray(data.items)
        ? data.items.map((item: any) => ({
            name: item.name || item.product_name || 'Unknown Item',
            quantity: item.quantity || item.qty || 1,
            price: item.price || item.unit_price || 0,
            notes: item.notes || item.special_instructions,
          }))
        : [],
      total: data.total || data.total_amount || 0,
      paymentMethod: data.payment_method || 'unknown',
      specialInstructions: data.special_instructions || data.notes,
      branchId: data.branch_id,
      metadata: { fallbackNormalization: true },
    };
  }
}
