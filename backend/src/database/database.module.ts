import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
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
import {
  BranchesRepository,
  RolesRepository,
  UsersRepository,
  UserBranchRolesRepository,
  DevicesRepository,
  SourceConnectorsRepository,
  RawOrdersRepository,
  NormalizedOrdersRepository,
  NormalizationErrorsRepository,
  AuditLogsRepository,
} from './repositories';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
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
    ]),
  ],
  providers: [
    BranchesRepository,
    RolesRepository,
    UsersRepository,
    UserBranchRolesRepository,
    DevicesRepository,
    SourceConnectorsRepository,
    RawOrdersRepository,
    NormalizedOrdersRepository,
    NormalizationErrorsRepository,
    AuditLogsRepository,
  ],
  exports: [
    BranchesRepository,
    RolesRepository,
    UsersRepository,
    UserBranchRolesRepository,
    DevicesRepository,
    SourceConnectorsRepository,
    RawOrdersRepository,
    NormalizedOrdersRepository,
    NormalizationErrorsRepository,
    AuditLogsRepository,
  ],
})
export class DatabaseModule {}
