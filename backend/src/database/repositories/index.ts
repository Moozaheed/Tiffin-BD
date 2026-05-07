import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import {
  Branches,
  Roles,
  Users,
  UserBranchRoles,
  Devices,
  SourceConnectors,
  RawOrders,
  NormalizedOrders,
  NormalizationErrors,
  AuditLogs,
} from './entities';

@Injectable()
export class BranchesRepository extends Repository<Branches> {
  constructor(private dataSource: DataSource) {
    super(Branches, dataSource.createEntityManager());
  }

  async findActiveBranches(): Promise<Branches[]> {
    return this.find({ where: { isActive: true } });
  }

  async findByCode(code: string): Promise<Branches | null> {
    return this.findOne({ where: { code } });
  }
}

@Injectable()
export class RolesRepository extends Repository<Roles> {
  constructor(private dataSource: DataSource) {
    super(Roles, dataSource.createEntityManager());
  }

  async findActiveRoles(): Promise<Roles[]> {
    return this.find({ where: { isActive: true } });
  }

  async findByCode(code: string): Promise<Roles | null> {
    return this.findOne({ where: { code } });
  }
}

@Injectable()
export class UsersRepository extends Repository<Users> {
  constructor(private dataSource: DataSource) {
    super(Users, dataSource.createEntityManager());
  }

  async findActiveUsers(): Promise<Users[]> {
    return this.find({ where: { isActive: true } });
  }

  async findByEmail(email: string): Promise<Users | null> {
    return this.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<Users | null> {
    return this.findOne({ where: { username } });
  }

  async findByExternalId(externalId: string): Promise<Users | null> {
    return this.findOne({ where: { externalId } });
  }

  async findWithBranchRoles(userId: string): Promise<Users | null> {
    return this.findOne({
      where: { id: userId },
      relations: ['primaryBranch', 'userBranchRoles', 'userBranchRoles.branch', 'userBranchRoles.role'],
    });
  }
}

@Injectable()
export class UserBranchRolesRepository extends Repository<UserBranchRoles> {
  constructor(private dataSource: DataSource) {
    super(UserBranchRoles, dataSource.createEntityManager());
  }

  async findUserBranchRoles(userId: string): Promise<UserBranchRoles[]> {
    return this.find({
      where: { userId, isActive: true },
      relations: ['branch', 'role'],
    });
  }

  async findUserBranchRole(userId: string, branchId: string, roleId: string): Promise<UserBranchRoles | null> {
    return this.findOne({
      where: { userId, branchId, roleId },
    });
  }

  async findUserBranches(userId: string): Promise<Branches[]> {
    const roles = await this.find({
      where: { userId, isActive: true },
      relations: ['branch'],
    });
    return roles.map((r) => r.branch);
  }
}

@Injectable()
export class DevicesRepository extends Repository<Devices> {
  constructor(private dataSource: DataSource) {
    super(Devices, dataSource.createEntityManager());
  }

  async findActiveBranchDevices(branchId: string): Promise<Devices[]> {
    return this.find({
      where: { branchId, isActive: true },
      relations: ['assignedUser'],
    });
  }

  async findByCode(code: string): Promise<Devices | null> {
    return this.findOne({ where: { code } });
  }

  async findByIMEI(imei: string): Promise<Devices | null> {
    return this.findOne({ where: { imei } });
  }
}

@Injectable()
export class SourceConnectorsRepository extends Repository<SourceConnectors> {
  constructor(private dataSource: DataSource) {
    super(SourceConnectors, dataSource.createEntityManager());
  }

  async findActiveConnectors(): Promise<SourceConnectors[]> {
    return this.find({ where: { isActive: true } });
  }

  async findByCode(code: string): Promise<SourceConnectors | null> {
    return this.findOne({ where: { code } });
  }

  async findByType(sourceType: string): Promise<SourceConnectors[]> {
    return this.find({ where: { sourceType, isActive: true } });
  }
}

@Injectable()
export class RawOrdersRepository extends Repository<RawOrders> {
  constructor(private dataSource: DataSource) {
    super(RawOrders, dataSource.createEntityManager());
  }

  async findPendingOrders(): Promise<RawOrders[]> {
    return this.find({
      where: { processingStatus: 'pending' },
      relations: ['sourceConnector', 'branch'],
      order: { createdAt: 'ASC' },
    });
  }

  async findBranchPendingOrders(branchId: string): Promise<RawOrders[]> {
    return this.find({
      where: { branchId, processingStatus: 'pending' },
      order: { createdAt: 'ASC' },
    });
  }

  async findByExternalOrderId(externalOrderId: string, sourceConnectorId: string): Promise<RawOrders | null> {
    return this.findOne({ where: { externalOrderId, sourceConnectorId } });
  }

  async findByIdempotencyKey(sourceConnectorId: string, idempotencyKey: string): Promise<RawOrders | null> {
    return this.findOne({ where: { sourceConnectorId, idempotencyKey } });
  }

  async findByStatus(status: string, limit = 100): Promise<RawOrders[]> {
    return this.find({
      where: { processingStatus: status },
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }

  async findRecent(sourceConnectorId: string, limit = 50): Promise<RawOrders[]> {
    return this.find({
      where: { sourceConnectorId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async markAsProcessed(id: string): Promise<void> {
    await this.update(id, { processingStatus: 'processed', processedAt: new Date() });
  }

  async markAsFailed(id: string, errorMessage: string): Promise<void> {
    await this.update(id, { processingStatus: 'failed', processingError: errorMessage });
  }

  async incrementRetryCount(id: string): Promise<void> {
    await this.increment({ id }, 'retryCount', 1);
  }
}

@Injectable()
export class NormalizedOrdersRepository extends Repository<NormalizedOrders> {
  constructor(private dataSource: DataSource) {
    super(NormalizedOrders, dataSource.createEntityManager());
  }

  async findBranchOrders(
    branchId: string,
    options?: { status?: string; skip?: number; take?: number },
  ): Promise<[NormalizedOrders[], number]> {
    const where: any = { branchId };
    if (options?.status) where.status = options.status;

    return this.findAndCount({
      where,
      relations: ['branch'],
      order: { createdAt: 'DESC' },
      skip: options?.skip || 0,
      take: options?.take || 20,
    });
  }

  async findByCustomerId(customerId: string): Promise<NormalizedOrders[]> {
    return this.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByExternalOrderId(externalOrderId: string, branchId: string): Promise<NormalizedOrders | null> {
    return this.findOne({ where: { externalOrderId, branchId } });
  }

  async findByCanonicalOrderNo(canonicalOrderNo: string): Promise<NormalizedOrders | null> {
    return this.findOne({ where: { canonicalOrderNo }, relations: ['branch'] });
  }

  async findByRawOrderId(rawOrderId: string): Promise<NormalizedOrders | null> {
    return this.findOne({ where: { rawOrderId } });
  }

  async findByStatus(status: string, branchId?: string): Promise<NormalizedOrders[]> {
    const where: any = { status };
    if (branchId) where.branchId = branchId;
    return this.find({ where, order: { createdAt: 'DESC' } });
  }

  async findPendingOrders(branchId: string): Promise<NormalizedOrders[]> {
    return this.find({
      where: { branchId, status: 'PENDING' },
      order: { createdAt: 'ASC' },
    });
  }

  async countByStatusAndBranch(branchId: string): Promise<Record<string, number>> {
    const result = await this.createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('order.branchId = :branchId', { branchId })
      .groupBy('order.status')
      .getRawMany();
    return result.reduce((acc: Record<string, number>, row: any) => {
      acc[row.status] = parseInt(row.count, 10);
      return acc;
    }, {});
  }

  async countTodayByBranch(branchId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.createQueryBuilder('order')
      .where('order.branchId = :branchId', { branchId })
      .andWhere('order.createdAt >= :today', { today })
      .getCount();
  }

  async findTodayOrders(branchId?: string): Promise<NormalizedOrders[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const qb = this.createQueryBuilder('order')
      .where('order.createdAt >= :today', { today })
      .orderBy('order.createdAt', 'DESC');
    if (branchId) qb.andWhere('order.branchId = :branchId', { branchId });
    return qb.getMany();
  }

  async getAverageResponseTime(branchId: string, days = 7): Promise<number | null> {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const result = await this.createQueryBuilder('order')
      .select('AVG(TIMESTAMPDIFF(SECOND, order.createdAt, order.acceptedAt))', 'avgSeconds')
      .where('order.branchId = :branchId', { branchId })
      .andWhere('order.acceptedAt IS NOT NULL')
      .andWhere('order.createdAt >= :since', { since })
      .getRawOne();
    return result?.avgSeconds ? parseFloat(result.avgSeconds) : null;
  }

  async countBySource(branchId?: string, days = 7): Promise<Array<{ source: string; count: number }>> {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const qb = this.createQueryBuilder('order')
      .select('order.source', 'source')
      .addSelect('COUNT(*)', 'count')
      .where('order.createdAt >= :since', { since })
      .groupBy('order.source');
    if (branchId) qb.andWhere('order.branchId = :branchId', { branchId });
    const raw = await qb.getRawMany();
    return raw.map((r: any) => ({ source: r.source, count: parseInt(r.count, 10) }));
  }
}

@Injectable()
export class NormalizationErrorsRepository extends Repository<NormalizationErrors> {
  constructor(private dataSource: DataSource) {
    super(NormalizationErrors, dataSource.createEntityManager());
  }

  async findUnresolvedErrors(branchId?: string): Promise<NormalizationErrors[]> {
    const query = this.createQueryBuilder('error')
      .leftJoinAndSelect('error.rawOrder', 'rawOrder')
      .where('error.status = :status', { status: 'unresolved' });

    if (branchId) {
      query.andWhere('error.branchId = :branchId', { branchId });
    }

    return query.orderBy('error.createdAt', 'DESC').getMany();
  }

  async findErrorsByRawOrder(rawOrderId: string): Promise<NormalizationErrors[]> {
    return this.find({ where: { rawOrderId } });
  }
}

@Injectable()
export class AuditLogsRepository extends Repository<AuditLogs> {
  constructor(private dataSource: DataSource) {
    super(AuditLogs, dataSource.createEntityManager());
  }

  async findUserActions(userId: string, days = 30): Promise<AuditLogs[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findEntityHistory(entityType: string, entityId: string): Promise<AuditLogs[]> {
    return this.find({
      where: { entityType, entityId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findBranchLogs(branchId: string, days = 7): Promise<AuditLogs[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.find({
      where: { branchId },
      order: { createdAt: 'DESC' },
      take: 1000,
    });
  }
}
