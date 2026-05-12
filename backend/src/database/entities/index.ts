import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';

/**
 * Branches Entity
 * Represents physical or logical branches of the business
 */
@Entity('branches')
@Index(['code'], { unique: true })
export class Branches {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 50, default: 'Asia/Dhaka' })
  timezone: string;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status: string;

  @Column({ type: 'simple-json', nullable: true })
  metadataJson: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Users, (user) => user.primaryBranch)
  users: Users[];

  @OneToMany(() => UserBranchRoles, (ubr) => ubr.branch)
  userBranchRoles: UserBranchRoles[];

  @OneToMany(() => Devices, (device) => device.branch)
  devices: Devices[];

  @OneToMany(() => RawOrders, (order) => order.branch)
  rawOrders: RawOrders[];

  @OneToMany(() => NormalizedOrders, (order) => order.branch)
  normalizedOrders: NormalizedOrders[];

  @OneToMany(() => AuditLogs, (log) => log.branch)
  auditLogs: AuditLogs[];
}

/**
 * Roles Entity
 * Represents user roles with specific permissions
 */
@Entity('roles')
@Index(['code'], { unique: true })
export class Roles {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-array', nullable: true })
  permissions: string[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserBranchRoles, (ubr) => ubr.role)
  userBranchRoles: UserBranchRoles[];
}

/**
 * Users Entity
 * Represents system users
 */
@Entity('users')
@Index(['email'], { unique: true })
@Index(['username'], { unique: true })
@Index(['externalId'], { unique: true, where: 'externalId IS NOT NULL' })
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  fullName: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  externalId: string;

  @Column({ type: 'varchar', length: 50, default: 'local' })
  authProvider: string;

  @ManyToOne(() => Branches, (branch) => branch.users)
  primaryBranch: Branches;

  @Column({ type: 'uuid' })
  primaryBranchId: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isSuperAdmin: boolean;

  @Column({ type: 'datetime', nullable: true })
  lastLoginAt: Date;

  @Column({ type: 'datetime', nullable: true })
  lastPasswordChangeAt: Date;

  @Column({ type: 'boolean', default: false })
  passwordChangeRequired: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserBranchRoles, (ubr) => ubr.user)
  userBranchRoles: UserBranchRoles[];

  @OneToMany(() => Devices, (device) => device.assignedUser)
  devices: Devices[];

  @OneToMany(() => AuditLogs, (log) => log.user)
  auditLogs: AuditLogs[];
}

/**
 * UserBranchRoles Entity
 * Junction table mapping users to branches and roles
 */
@Entity('user_branch_roles')
@Index(['userId', 'branchId', 'roleId'], { unique: true })
export class UserBranchRoles {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Users, (user) => user.userBranchRoles, { onDelete: 'CASCADE' })
  user: Users;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => Branches, (branch) => branch.userBranchRoles, { onDelete: 'CASCADE' })
  branch: Branches;

  @Column({ type: 'uuid' })
  branchId: string;

  @ManyToOne(() => Roles, (role) => role.userBranchRoles, { onDelete: 'CASCADE' })
  role: Roles;

  @Column({ type: 'uuid' })
  roleId: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

/**
 * Devices Entity
 * Represents devices used for order ingestion/submission
 */
@Entity('devices')
@Index(['code'], { unique: true })
@Index(['branchId', 'code'], { unique: true })
export class Devices {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  deviceType: string;

  @ManyToOne(() => Users, (user) => user.devices)
  assignedUser: Users;

  @Column({ type: 'uuid', nullable: true })
  assignedUserId: string;

  @ManyToOne(() => Branches, (branch) => branch.devices)
  branch: Branches;

  @Column({ type: 'uuid' })
  branchId: string;

  @Column({ type: 'text', nullable: true })
  serialNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  imei: string;

  @Column({ type: 'text', nullable: true })
  fcmToken: string;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string;

  @Column({ type: 'datetime', nullable: true })
  lastSyncAt: Date;

  @Column({ type: 'datetime', nullable: true })
  lastActivityAt: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

/**
 * SourceConnectors Entity
 * Represents external source systems for data ingestion
 */
@Entity('source_connectors')
@Index(['code'], { unique: true })
export class SourceConnectors {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  sourceType: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-json', nullable: true })
  connectionConfig: Record<string, any>;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'datetime', nullable: true })
  lastSyncAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => RawOrders, (order) => order.sourceConnector)
  rawOrders: RawOrders[];
}

/**
 * RawOrders Entity
 * Represents ingested order data before normalization
 */
@Entity('raw_orders')
@Index(['externalOrderId', 'sourceConnectorId'], { unique: true })
@Index(['sourceConnectorId', 'idempotencyKey'], { unique: true })
@Index(['branchId'])
@Index(['createdAt'])
@Index(['processingStatus', 'createdAt'])
@Index(['idempotencyKey'])
export class RawOrders {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  externalOrderId: string;

  @Column({ type: 'varchar', length: 255 })
  idempotencyKey: string;

  @ManyToOne(() => SourceConnectors, (connector) => connector.rawOrders)
  sourceConnector: SourceConnectors;

  @Column({ type: 'uuid' })
  sourceConnectorId: string;

  @ManyToOne(() => Branches, (branch) => branch.rawOrders)
  branch: Branches;

  @Column({ type: 'uuid' })
  branchId: string;

  @Column({ type: 'simple-json' })
  rawData: Record<string, any>;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  processingStatus: string;

  @Column({ type: 'text', nullable: true })
  processingError: string;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'datetime' })
  receivedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  processedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => NormalizationErrors, (error) => error.rawOrder)
  normalizationErrors: NormalizationErrors[];
}

/**
 * NormalizedOrders Entity
 * Represents normalized order data ready for business logic
 */
@Entity('normalized_orders')
@Index(['externalOrderId', 'branchId'], { unique: true })
@Index(['canonicalOrderNo'], { unique: true })
@Index(['branchId'])
@Index(['customerId'])
@Index(['status', 'branchId'])
@Index(['createdAt'])
export class NormalizedOrders {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  canonicalOrderNo: string;

  @Column({ type: 'varchar', length: 100 })
  externalOrderId: string;

  @Column({ type: 'varchar', length: 50 })
  source: string;

  @Column({ type: 'uuid', nullable: true })
  rawOrderId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  customerId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  customerName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  customerPhone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  customerEmail: string;

  @ManyToOne(() => Branches, (branch) => branch.normalizedOrders)
  branch: Branches;

  @Column({ type: 'uuid' })
  branchId: string;

  @Column({ type: 'text', nullable: true })
  deliveryAddress: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotalAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  deliveryFee: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'varchar', length: 10, default: 'BDT' })
  currency: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  paymentMethod: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  paymentStatus: string;

  @Column({ type: 'simple-json' })
  items: Record<string, any>[];

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'uuid', nullable: true })
  acceptedByUserId: string;

  @Column({ type: 'datetime', nullable: true })
  acceptedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  escalatedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  cancelledAt: Date;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;

  @Column({ type: 'text', nullable: true })
  escalationReason: string;

  @Column({ type: 'datetime', nullable: true })
  deliveryDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

/**
 * NormalizationErrors Entity
 * Tracks errors encountered during order normalization
 */
@Entity('normalization_errors')
@Index(['rawOrderId'])
@Index(['branchId'])
@Index(['createdAt'])
export class NormalizationErrors {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => RawOrders, (order) => order.normalizationErrors, { onDelete: 'CASCADE' })
  rawOrder: RawOrders;

  @Column({ type: 'uuid' })
  rawOrderId: string;

  @ManyToOne(() => Branches)
  branch: Branches;

  @Column({ type: 'uuid' })
  branchId: string;

  @Column({ type: 'varchar', length: 100 })
  errorCode: string;

  @Column({ type: 'text' })
  errorMessage: string;

  @Column({ type: 'text', nullable: true })
  errorDetails: string;

  @Column({ type: 'varchar', length: 50, default: 'unresolved' })
  status: string;

  @Column({ type: 'datetime', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'text', nullable: true })
  resolution: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

/**
 * AuditLogs Entity
 * Tracks user actions for compliance and debugging
 */
@Entity('audit_logs')
@Index(['userId', 'branchId'])
@Index(['branchId'])
@Index(['entityType', 'entityId'])
@Index(['createdAt'])
export class AuditLogs {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Users, (user) => user.auditLogs)
  user: Users;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @ManyToOne(() => Branches, (branch) => branch.auditLogs)
  branch: Branches;

  @Column({ type: 'uuid', nullable: true })
  branchId: string;

  @Column({ type: 'varchar', length: 50 })
  action: string;

  @Column({ type: 'varchar', length: 100 })
  entityType: string;

  @Column({ type: 'varchar', length: 100 })
  entityId: string;

  @Column({ type: 'simple-json', nullable: true })
  oldValues: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  newValues: Record<string, any>;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  correlationId: string;

  @CreateDateColumn()
  createdAt: Date;
}
