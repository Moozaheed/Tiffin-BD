import { Injectable } from '@nestjs/common';
import { BranchesRepository, UserBranchRolesRepository, AuditLogsRepository } from '../../database/repositories';
import { Branches } from '../../database/entities';
import { LoggerService } from '../../common/logger/logger.service';
import { NotFoundException, ConflictException } from '../../common/exceptions';
import { AuditAction, BranchStatus, PAGINATION_CONSTANTS } from '../../common/constants';
import { CreateBranchDto, UpdateBranchDto } from './dto';

@Injectable()
export class BranchesService {
  constructor(
    private readonly branchesRepository: BranchesRepository,
    private readonly userBranchRolesRepository: UserBranchRolesRepository,
    private readonly auditLogsRepository: AuditLogsRepository,
    private readonly logger: LoggerService,
  ) {}

  async create(createBranchDto: CreateBranchDto, actorId?: string): Promise<Branches> {
    const existing = await this.branchesRepository.findByCode(createBranchDto.code);
    if (existing) {
      throw new ConflictException(`Branch with code '${createBranchDto.code}' already exists`);
    }

    const branch = this.branchesRepository.create(createBranchDto);
    const saved = await this.branchesRepository.save(branch);

    await this.auditLogsRepository.save({
      userId: actorId,
      action: AuditAction.CREATE,
      entityType: 'Branch',
      entityId: saved.id,
      newValues: { code: saved.code, name: saved.name },
    });

    this.logger.info(`Branch created: ${saved.code}`, 'BranchesService', { branchId: saved.id });
    return saved;
  }

  async findAll(page = PAGINATION_CONSTANTS.DEFAULT_PAGE, limit = PAGINATION_CONSTANTS.DEFAULT_LIMIT) {
    const take = Math.min(limit, PAGINATION_CONSTANTS.MAX_LIMIT);
    const skip = (page - 1) * take;

    const [branches, total] = await this.branchesRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take,
    });

    return {
      data: branches,
      total,
      page,
      limit: take,
      totalPages: Math.ceil(total / take),
    };
  }

  async findActive(): Promise<Branches[]> {
    return this.branchesRepository.findActiveBranches();
  }

  async findOne(id: string): Promise<Branches> {
    const branch = await this.branchesRepository.findOne({ where: { id } });
    if (!branch) {
      throw new NotFoundException('Branch', id);
    }
    return branch;
  }

  async findByCode(code: string): Promise<Branches> {
    const branch = await this.branchesRepository.findByCode(code);
    if (!branch) {
      throw new NotFoundException('Branch', `code=${code}`);
    }
    return branch;
  }

  async update(id: string, updateBranchDto: UpdateBranchDto, actorId?: string): Promise<Branches> {
    const branch = await this.findOne(id);

    const oldValues = { name: branch.name, isActive: branch.isActive };
    Object.assign(branch, updateBranchDto);
    const saved = await this.branchesRepository.save(branch);

    await this.auditLogsRepository.save({
      userId: actorId,
      branchId: id,
      action: AuditAction.UPDATE,
      entityType: 'Branch',
      entityId: id,
      oldValues,
      newValues: updateBranchDto,
    });

    this.logger.info(`Branch updated: ${saved.code}`, 'BranchesService', { branchId: id });
    return saved;
  }

  async remove(id: string, actorId?: string): Promise<void> {
    const branch = await this.findOne(id);
    branch.isActive = false;
    await this.branchesRepository.save(branch);

    await this.auditLogsRepository.save({
      userId: actorId,
      branchId: id,
      action: AuditAction.DELETE,
      entityType: 'Branch',
      entityId: id,
      oldValues: { isActive: true },
      newValues: { isActive: false },
    });

    this.logger.info(`Branch deactivated: ${branch.code}`, 'BranchesService', { branchId: id });
  }

  async activate(id: string, actorId?: string): Promise<Branches> {
    const branch = await this.findOne(id);
    branch.isActive = true;
    branch.status = BranchStatus.ACTIVE;
    const saved = await this.branchesRepository.save(branch);

    await this.auditLogsRepository.save({
      userId: actorId,
      branchId: id,
      action: AuditAction.UPDATE,
      entityType: 'Branch',
      entityId: id,
      oldValues: { isActive: false },
      newValues: { isActive: true, status: BranchStatus.ACTIVE },
    });

    this.logger.info(`Branch activated: ${branch.code}`, 'BranchesService', { branchId: id });
    return saved;
  }

  async getMetadata(id: string): Promise<Record<string, any>> {
    const branch = await this.findOne(id);
    return branch.metadataJson || {};
  }

  async updateMetadata(id: string, metadata: Record<string, any>, actorId?: string): Promise<Branches> {
    const branch = await this.findOne(id);
    const oldMetadata = branch.metadataJson;
    branch.metadataJson = { ...(branch.metadataJson || {}), ...metadata };
    const saved = await this.branchesRepository.save(branch);

    await this.auditLogsRepository.save({
      userId: actorId,
      branchId: id,
      action: AuditAction.UPDATE,
      entityType: 'Branch',
      entityId: id,
      oldValues: { metadataJson: oldMetadata },
      newValues: { metadataJson: saved.metadataJson },
    });

    return saved;
  }

  async getBranchUsers(id: string) {
    await this.findOne(id);
    const branchRoles = await this.userBranchRolesRepository.find({
      where: { branchId: id, isActive: true },
      relations: ['user', 'role'],
    });

    return branchRoles.map((ubr) => ({
      userId: ubr.userId,
      username: ubr.user?.username,
      fullName: ubr.user?.fullName,
      roleCode: ubr.role?.code,
      roleName: ubr.role?.name,
    }));
  }
}
