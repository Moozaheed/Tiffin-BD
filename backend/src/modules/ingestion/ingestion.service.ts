import { Injectable, OnModuleInit, Optional } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { v4 as uuid } from 'uuid';
import { RawOrdersRepository, SourceConnectorsRepository } from '../../database/repositories';
import { LoggerService } from '../../common/logger/logger.service';
import { ConfigService } from '../../config/config.service';
import { SourceType, RABBITMQ_CONSTANTS } from '../../common/constants';
import {
  ConnectorRegistry,
  WebsiteConnector,
  FoodpandaConnector,
  FoodiConnector,
  PathaoConnector,
  ChilliPosConnector,
  BaseConnector,
  ThirdPartyConnector,
  InvalidPayloadException,
  InvalidSignatureException,
  UnsupportedSourceException,
  DuplicateOrderException,
  RateLimitExceededException,
} from './connectors';
import { IdempotencyService } from './services/idempotency.service';
import { RateLimiterService } from './services/rate-limiter.service';

export interface IngestionResult {
  status: string;
  rawOrderId: string;
  sourceOrderId: string;
  correlationId: string;
  timestamp: string;
  message: string;
}

@Injectable()
export class IngestionService implements OnModuleInit {
  constructor(
    @Optional() private readonly amqpConnection: AmqpConnection,
    private readonly rawOrdersRepository: RawOrdersRepository,
    private readonly sourceConnectorsRepository: SourceConnectorsRepository,
    private readonly connectorRegistry: ConnectorRegistry,
    private readonly idempotencyService: IdempotencyService,
    private readonly rateLimiterService: RateLimiterService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly websiteConnector: WebsiteConnector,
    private readonly foodpandaConnector: FoodpandaConnector,
    private readonly foodiConnector: FoodiConnector,
    private readonly pathaoConnector: PathaoConnector,
    private readonly chilliPosConnector: ChilliPosConnector,
  ) {}

  onModuleInit() {
    this.connectorRegistry.register(SourceType.WEBSITE, this.websiteConnector);
    this.connectorRegistry.register(SourceType.FOODPANDA, this.foodpandaConnector);
    this.connectorRegistry.register(SourceType.FOODI, this.foodiConnector);
    this.connectorRegistry.register(SourceType.PATHAO, this.pathaoConnector);
    this.connectorRegistry.register(SourceType.CHILLI_POS, this.chilliPosConnector);
    this.logger.info(
      `Registered connectors: ${this.connectorRegistry.listConnectors().join(', ')}`,
      'IngestionService',
    );
  }

  async ingestWebsiteOrder(payload: any, branchId?: string): Promise<IngestionResult> {
    return this.ingestOrder(SourceType.WEBSITE, payload, branchId);
  }

  async ingestThirdPartyOrder(
    source: string,
    payload: any,
    rawBody: string,
    signature?: string,
  ): Promise<IngestionResult> {
    const sourceType = source.toLowerCase() as SourceType;

    if (!this.connectorRegistry.isRegistered(sourceType)) {
      throw new UnsupportedSourceException(source);
    }

    const connector = this.connectorRegistry.getConnectorOrThrow(sourceType);

    if (connector instanceof ThirdPartyConnector && signature) {
      const secret = this.getHmacSecret(sourceType);
      if (secret) {
        try {
          const valid = connector.verifyHmacSignature(rawBody, signature, secret);
          if (!valid) {
            throw new InvalidSignatureException(sourceType);
          }
        } catch (err) {
          if (err instanceof InvalidSignatureException) throw err;
          throw new InvalidSignatureException(sourceType);
        }
      }
    }

    return this.ingestOrder(sourceType, payload);
  }

  async ingestChilliPosOrder(payload: any): Promise<IngestionResult> {
    return this.ingestOrder(SourceType.CHILLI_POS, payload);
  }

  private async ingestOrder(sourceType: string, payload: any, branchIdOverride?: string): Promise<IngestionResult> {
    const correlationId = `req-${uuid()}`;

    const connector = this.connectorRegistry.getConnectorOrThrow(sourceType);

    const sourceConnector = await this.sourceConnectorsRepository.findByCode(sourceType);
    const sourceConnectorId = sourceConnector?.id || sourceType;

    const rateResult = await this.rateLimiterService.checkAndRecord(sourceConnectorId);
    if (!rateResult.allowed) {
      throw new RateLimitExceededException(
        100,
        '60s',
        Math.ceil(rateResult.retryAfterMs / 1000),
      );
    }

    if (!connector.validateRequest(payload)) {
      throw new InvalidPayloadException(sourceType, 'Payload validation failed');
    }

    const sourceOrderId = connector.extractSourceOrderId(payload);
    const idempotencyKey = connector.buildIdempotencyKey(payload);

    const existingOrderId = await this.idempotencyService.checkIfProcessed(sourceConnectorId, idempotencyKey);
    if (existingOrderId) {
      throw new DuplicateOrderException(idempotencyKey, existingOrderId);
    }

    const intermediate = connector.toIntermediateOrder(payload);
    const effectiveBranchId = branchIdOverride || intermediate.branchId;

    const rawOrder = this.rawOrdersRepository.create({
      externalOrderId: sourceOrderId,
      idempotencyKey,
      sourceConnectorId,
      branchId: effectiveBranchId || 'unassigned',
      rawData: payload,
      processingStatus: 'new',
      receivedAt: new Date(),
    });

    let savedOrder;
    try {
      savedOrder = await this.rawOrdersRepository.save(rawOrder);
    } catch (err: any) {
      if (err.code === 'ER_DUP_ENTRY' || err.message?.includes('Duplicate')) {
        throw new DuplicateOrderException(idempotencyKey);
      }
      throw err;
    }

    await this.idempotencyService.markAsProcessed(sourceConnectorId, idempotencyKey, savedOrder.id);

    await this.amqpConnection.publish(
      RABBITMQ_CONSTANTS.EXCHANGE,
      RABBITMQ_CONSTANTS.NORMALIZATION_ROUTING_KEY,
      {
        rawOrderId: savedOrder.id,
        correlationId,
        attempt: 1,
      },
      {
        persistent: true,
        messageId: savedOrder.id,
        correlationId,
        headers: { 'x-retry-count': 0 },
      },
    );

    this.logger.info(
      `Order ingested: ${sourceOrderId} from ${sourceType}`,
      'IngestionService',
      { rawOrderId: savedOrder.id, correlationId, branchId: effectiveBranchId },
    );

    return {
      status: 'accepted',
      rawOrderId: savedOrder.id,
      sourceOrderId,
      correlationId,
      timestamp: new Date().toISOString(),
      message: 'Order received and queued for processing',
    };
  }

  private getHmacSecret(sourceType: SourceType): string | undefined {
    switch (sourceType) {
      case SourceType.FOODPANDA:
        return this.configService.foodpandaHmacSecret;
      case SourceType.FOODI:
        return this.configService.foodiHmacSecret;
      case SourceType.PATHAO:
        return this.configService.pathaoHmacSecret;
      default:
        return undefined;
    }
  }
}
