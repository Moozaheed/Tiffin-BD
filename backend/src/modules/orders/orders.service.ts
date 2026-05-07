import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { NormalizedOrdersRepository } from '../../database/repositories';
import { NormalizedOrders } from '../../database/entities';
import { LoggerService } from '../../common/logger/logger.service';
import {
  OrderLifecycleStatus,
  ORDER_STATE_TRANSITIONS,
} from '../../common/constants';

export interface OrderTransitionResult {
  orderId: string;
  canonicalOrderNo: string;
  previousStatus: string;
  newStatus: string;
  timestamp: string;
}

export interface OrderListQuery {
  branchId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly normalizedOrdersRepository: NormalizedOrdersRepository,
    private readonly logger: LoggerService,
  ) {}

  async getOrder(id: string): Promise<NormalizedOrders> {
    const order = await this.normalizedOrdersRepository.findOne({
      where: { id },
      relations: ['branch'],
    });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  async getOrderByCanonical(canonicalOrderNo: string): Promise<NormalizedOrders> {
    const order = await this.normalizedOrdersRepository.findByCanonicalOrderNo(canonicalOrderNo);
    if (!order) throw new NotFoundException(`Order ${canonicalOrderNo} not found`);
    return order;
  }

  async listOrders(query: OrderListQuery): Promise<{ data: NormalizedOrders[]; total: number }> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    if (query.branchId) {
      const [data, total] = await this.normalizedOrdersRepository.findBranchOrders(
        query.branchId,
        { status: query.status, skip, take: limit },
      );
      return { data, total };
    }

    const where: any = {};
    if (query.status) where.status = query.status;

    const [data, total] = await this.normalizedOrdersRepository.findAndCount({
      where,
      relations: ['branch'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total };
  }

  async acceptOrder(orderId: string, userId: string): Promise<OrderTransitionResult> {
    const order = await this.getOrder(orderId);
    this.validateTransition(order, OrderLifecycleStatus.ACCEPTED);

    const previousStatus = order.status;
    await this.normalizedOrdersRepository.update(orderId, {
      status: OrderLifecycleStatus.ACCEPTED,
      acceptedAt: new Date(),
      acceptedByUserId: userId,
    });

    this.logger.info(
      `Order ${order.canonicalOrderNo} accepted by ${userId}`,
      'OrdersService',
      { orderId, previousStatus },
    );

    return this.buildTransitionResult(order, previousStatus, OrderLifecycleStatus.ACCEPTED);
  }

  async escalateOrder(
    orderId: string,
    reason?: string,
  ): Promise<OrderTransitionResult> {
    const order = await this.getOrder(orderId);
    this.validateTransition(order, OrderLifecycleStatus.ESCALATED);

    const previousStatus = order.status;
    await this.normalizedOrdersRepository.update(orderId, {
      status: OrderLifecycleStatus.ESCALATED,
      escalatedAt: new Date(),
      escalationReason: reason || 'No reason provided',
    });

    this.logger.warn(
      `Order ${order.canonicalOrderNo} escalated: ${reason}`,
      'OrdersService',
      { orderId, previousStatus },
    );

    return this.buildTransitionResult(order, previousStatus, OrderLifecycleStatus.ESCALATED);
  }

  async completeOrder(orderId: string): Promise<OrderTransitionResult> {
    const order = await this.getOrder(orderId);
    this.validateTransition(order, OrderLifecycleStatus.COMPLETED);

    const previousStatus = order.status;
    await this.normalizedOrdersRepository.update(orderId, {
      status: OrderLifecycleStatus.COMPLETED,
      completedAt: new Date(),
    });

    this.logger.info(
      `Order ${order.canonicalOrderNo} completed`,
      'OrdersService',
      { orderId },
    );

    return this.buildTransitionResult(order, previousStatus, OrderLifecycleStatus.COMPLETED);
  }

  async cancelOrder(
    orderId: string,
    reason?: string,
  ): Promise<OrderTransitionResult> {
    const order = await this.getOrder(orderId);
    this.validateTransition(order, OrderLifecycleStatus.CANCELLED);

    const previousStatus = order.status;
    await this.normalizedOrdersRepository.update(orderId, {
      status: OrderLifecycleStatus.CANCELLED,
      cancelledAt: new Date(),
      cancellationReason: reason || 'No reason provided',
    });

    this.logger.info(
      `Order ${order.canonicalOrderNo} cancelled: ${reason}`,
      'OrdersService',
      { orderId, previousStatus },
    );

    return this.buildTransitionResult(order, previousStatus, OrderLifecycleStatus.CANCELLED);
  }

  async markPreparing(orderId: string): Promise<OrderTransitionResult> {
    const order = await this.getOrder(orderId);
    this.validateTransition(order, OrderLifecycleStatus.PREPARING);

    const previousStatus = order.status;
    await this.normalizedOrdersRepository.update(orderId, {
      status: OrderLifecycleStatus.PREPARING,
    });

    return this.buildTransitionResult(order, previousStatus, OrderLifecycleStatus.PREPARING);
  }

  async markReady(orderId: string): Promise<OrderTransitionResult> {
    const order = await this.getOrder(orderId);
    this.validateTransition(order, OrderLifecycleStatus.READY);

    const previousStatus = order.status;
    await this.normalizedOrdersRepository.update(orderId, {
      status: OrderLifecycleStatus.READY,
    });

    return this.buildTransitionResult(order, previousStatus, OrderLifecycleStatus.READY);
  }

  async getPendingOrders(branchId: string): Promise<NormalizedOrders[]> {
    return this.normalizedOrdersRepository.findPendingOrders(branchId);
  }

  private validateTransition(
    order: NormalizedOrders,
    targetStatus: OrderLifecycleStatus,
  ): void {
    const currentStatus = order.status as OrderLifecycleStatus;
    const allowed = ORDER_STATE_TRANSITIONS[currentStatus];

    if (!allowed || !allowed.includes(targetStatus)) {
      throw new BadRequestException(
        `Cannot transition order from ${currentStatus} to ${targetStatus}. ` +
        `Allowed transitions: ${(allowed || []).join(', ') || 'none'}`,
      );
    }
  }

  private buildTransitionResult(
    order: NormalizedOrders,
    previousStatus: string,
    newStatus: string,
  ): OrderTransitionResult {
    return {
      orderId: order.id,
      canonicalOrderNo: order.canonicalOrderNo,
      previousStatus,
      newStatus,
      timestamp: new Date().toISOString(),
    };
  }
}
