import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  UsersRepository,
  UserBranchRolesRepository,
  BranchesRepository,
  RolesRepository,
  AuditLogsRepository,
} from '../../database/repositories';
import { Users, UserBranchRoles } from '../../database/entities';
import { LoggerService } from '../../common/logger/logger.service';
import {
  NotFoundException,
  ConflictException,
  AuthenticationException,
  ValidationException,
} from '../../common/exceptions';
import { AuditAction, PAGINATION_CONSTANTS } from '../../common/constants';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto, UserResponseDto, PaginatedUsersResponseDto } from './dto';

const SALT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly userBranchRolesRepository: UserBranchRolesRepository,
    private readonly branchesRepository: BranchesRepository,
    private readonly rolesRepository: RolesRepository,
    private readonly auditLogsRepository: AuditLogsRepository,
    private readonly logger: LoggerService,
  ) {}

  async create(createUserDto: CreateUserDto, actorId?: string): Promise<UserResponseDto> {
    const existingByUsername = await this.usersRepository.findByUsername(createUserDto.username);
    if (existingByUsername) {
      throw new ConflictException(`Username '${createUserDto.username}' already exists`);
    }

    const existingByEmail = await this.usersRepository.findByEmail(createUserDto.email);
    if (existingByEmail) {
      throw new ConflictException(`Email '${createUserDto.email}' already exists`);
    }

    const branch = await this.branchesRepository.findOne({ where: { id: createUserDto.primaryBranchId } });
    if (!branch) {
      throw new NotFoundException('Branch', createUserDto.primaryBranchId);
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, SALT_ROUNDS);

    const user = this.usersRepository.create({
      username: createUserDto.username,
      email: createUserDto.email,
      fullName: createUserDto.fullName,
      passwordHash,
      primaryBranchId: createUserDto.primaryBranchId,
      isSuperAdmin: createUserDto.isSuperAdmin || false,
    });

    const savedUser = await this.usersRepository.save(user);

    if (createUserDto.branchRoles?.length) {
      for (const br of createUserDto.branchRoles) {
        const branchRoleAssignment = this.userBranchRolesRepository.create({
          userId: savedUser.id,
          branchId: br.branchId,
          roleId: br.roleId,
        });
        await this.userBranchRolesRepository.save(branchRoleAssignment);
      }
    }

    await this.auditLogsRepository.save({
      userId: actorId || savedUser.id,
      action: AuditAction.CREATE,
      entityType: 'User',
      entityId: savedUser.id,
      newValues: { username: savedUser.username, email: savedUser.email },
    });

    this.logger.info(`User created: ${savedUser.username}`, 'UsersService', { userId: savedUser.id });

    return this.toResponseDto(savedUser);
  }

  async findAll(
    page = PAGINATION_CONSTANTS.DEFAULT_PAGE,
    limit = PAGINATION_CONSTANTS.DEFAULT_LIMIT,
    search?: string,
  ): Promise<PaginatedUsersResponseDto> {
    const take = Math.min(limit, PAGINATION_CONSTANTS.MAX_LIMIT);
    const skip = (page - 1) * take;

    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    if (search) {
      queryBuilder.where(
        'user.username LIKE :search OR user.email LIKE :search OR user.fullName LIKE :search',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy('user.createdAt', 'DESC').skip(skip).take(take);

    const [users, total] = await queryBuilder.getManyAndCount();

    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        const branchRoles = await this.userBranchRolesRepository.findUserBranchRoles(user.id);
        return this.toResponseDto(user, branchRoles);
      }),
    );

    return {
      data: usersWithRoles,
      total,
      page,
      limit: take,
      totalPages: Math.ceil(total / take),
    };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User', id);
    }

    const branchRoles = await this.userBranchRolesRepository.findUserBranchRoles(user.id);
    return this.toResponseDto(user, branchRoles);
  }

  async update(id: string, updateUserDto: UpdateUserDto, actorId?: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User', id);
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingByEmail = await this.usersRepository.findByEmail(updateUserDto.email);
      if (existingByEmail) {
        throw new ConflictException(`Email '${updateUserDto.email}' already exists`);
      }
    }

    if (updateUserDto.primaryBranchId) {
      const branch = await this.branchesRepository.findOne({ where: { id: updateUserDto.primaryBranchId } });
      if (!branch) {
        throw new NotFoundException('Branch', updateUserDto.primaryBranchId);
      }
    }

    const oldValues = { fullName: user.fullName, email: user.email, isActive: user.isActive };

    Object.assign(user, updateUserDto);
    const savedUser = await this.usersRepository.save(user);

    await this.auditLogsRepository.save({
      userId: actorId || id,
      action: AuditAction.UPDATE,
      entityType: 'User',
      entityId: id,
      oldValues,
      newValues: updateUserDto,
    });

    this.logger.info(`User updated: ${savedUser.username}`, 'UsersService', { userId: id });

    const branchRoles = await this.userBranchRolesRepository.findUserBranchRoles(savedUser.id);
    return this.toResponseDto(savedUser, branchRoles);
  }

  async remove(id: string, actorId?: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User', id);
    }

    user.isActive = false;
    await this.usersRepository.save(user);

    await this.auditLogsRepository.save({
      userId: actorId || id,
      action: AuditAction.DELETE,
      entityType: 'User',
      entityId: id,
      oldValues: { username: user.username, isActive: true },
      newValues: { isActive: false },
    });

    this.logger.info(`User deactivated: ${user.username}`, 'UsersService', { userId: id });
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User', userId);
    }

    const isCurrentValid = await bcrypt.compare(changePasswordDto.currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      throw new AuthenticationException('Current password is incorrect');
    }

    user.passwordHash = await bcrypt.hash(changePasswordDto.newPassword, SALT_ROUNDS);
    user.lastPasswordChangeAt = new Date();
    user.passwordChangeRequired = false;
    await this.usersRepository.save(user);

    this.logger.info(`Password changed for user: ${user.username}`, 'UsersService', { userId });
  }

  async assignBranchRole(userId: string, branchId: string, roleId: string, actorId?: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User', userId);

    const branch = await this.branchesRepository.findOne({ where: { id: branchId } });
    if (!branch) throw new NotFoundException('Branch', branchId);

    const role = await this.rolesRepository.findOne({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Role', roleId);

    const existing = await this.userBranchRolesRepository.findUserBranchRole(userId, branchId, roleId);
    if (existing) {
      throw new ConflictException('User already has this role for this branch');
    }

    const assignment = this.userBranchRolesRepository.create({ userId, branchId, roleId });
    await this.userBranchRolesRepository.save(assignment);

    await this.auditLogsRepository.save({
      userId: actorId,
      action: AuditAction.CREATE,
      entityType: 'UserBranchRole',
      entityId: assignment.id,
      newValues: { userId, branchId, roleId },
    });

    this.logger.info(`Branch role assigned`, 'UsersService', { userId, branchId, roleId });
  }

  async removeBranchRole(userId: string, branchId: string, roleId: string, actorId?: string): Promise<void> {
    const assignment = await this.userBranchRolesRepository.findUserBranchRole(userId, branchId, roleId);
    if (!assignment) {
      throw new NotFoundException('UserBranchRole', `${userId}/${branchId}/${roleId}`);
    }

    assignment.isActive = false;
    await this.userBranchRolesRepository.save(assignment);

    await this.auditLogsRepository.save({
      userId: actorId,
      action: AuditAction.DELETE,
      entityType: 'UserBranchRole',
      entityId: assignment.id,
      oldValues: { userId, branchId, roleId, isActive: true },
      newValues: { isActive: false },
    });
  }

  private toResponseDto(user: Users, branchRoles?: UserBranchRoles[]): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      isActive: user.isActive,
      isSuperAdmin: user.isSuperAdmin,
      primaryBranchId: user.primaryBranchId,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      branchRoles: branchRoles?.map((ubr) => ({
        branchId: ubr.branchId,
        branchName: ubr.branch?.name || '',
        roleCode: ubr.role?.code || '',
        roleName: ubr.role?.name || '',
      })),
    };
  }
}
