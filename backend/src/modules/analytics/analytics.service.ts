import { Injectable } from '@nestjs/common';
import { NormalizedOrdersRepository } from '../../database/repositories';

export interface TodaySummary {
  totalOrders: number;
  ordersByStatus: Record<string, number>;
  date: string;
}

export interface BranchSummary {
  branchId: string;
  totalOrders: number;
  ordersByStatus: Record<string, number>;
  todayCount: number;
}

export interface ResponseTimeSummary {
  branchId: string;
  averageResponseSeconds: number | null;
  period: string;
}

export interface SourceBreakdown {
  source: string;
  count: number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly normalizedOrdersRepository: NormalizedOrdersRepository,
  ) {}

  async getTodaySummary(branchId?: string): Promise<TodaySummary> {
    const orders = await this.normalizedOrdersRepository.findTodayOrders(branchId);

    const ordersByStatus: Record<string, number> = {};
    for (const order of orders) {
      ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;
    }

    return {
      totalOrders: orders.length,
      ordersByStatus,
      date: new Date().toISOString().slice(0, 10),
    };
  }

  async getBranchSummary(branchId: string): Promise<BranchSummary> {
    const ordersByStatus = await this.normalizedOrdersRepository.countByStatusAndBranch(branchId);
    const todayCount = await this.normalizedOrdersRepository.countTodayByBranch(branchId);

    const totalOrders = Object.values(ordersByStatus).reduce((sum, count) => sum + count, 0);

    return {
      branchId,
      totalOrders,
      ordersByStatus,
      todayCount,
    };
  }

  async getResponseTime(branchId: string, days = 7): Promise<ResponseTimeSummary> {
    const avgSeconds = await this.normalizedOrdersRepository.getAverageResponseTime(branchId, days);

    return {
      branchId,
      averageResponseSeconds: avgSeconds,
      period: `${days}d`,
    };
  }

  async getOrdersBySource(branchId?: string, days = 7): Promise<SourceBreakdown[]> {
    return this.normalizedOrdersRepository.countBySource(branchId, days);
  }
}
