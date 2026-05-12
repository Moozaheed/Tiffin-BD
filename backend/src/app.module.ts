import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigService } from './config/config.service';
import { ConfigModule as ConfigModuleCustom } from './config/config.module';
import { LoggerService } from './common/logger/logger.service';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BranchesModule } from './modules/branches/branches.module';
import { IngestionModule } from './modules/ingestion/ingestion.module';
import { NormalizationModule } from './modules/normalization/normalization.module';
import { OrdersModule } from './modules/orders/orders.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { EscalationModule } from './modules/escalation/escalation.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { PrintingModule } from './modules/printing/printing.module';
import { DevicesModule } from './modules/devices/devices.module';
import { HealthModule } from './health/health.module';
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
} from './database/entities';
import { RABBITMQ_CONSTANTS } from './common/constants';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ConfigModuleCustom,
    SharedModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'mysql',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME || 'tiffin_user',
      password: process.env.DB_PASSWORD || 'tiffin_pass_123',
      database: process.env.DB_DATABASE || 'tiffin_db',
      entities: [
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
      ],
      synchronize: (process.env.DB_SYNCHRONIZE || 'false') === 'true',
      logging: (process.env.DB_LOGGING || 'false') === 'true' ? ['query', 'error'] : ['error'],
      maxQueryExecutionTime: 5000,
      extra: {
        connectionLimit: 10,
        supportBigNumbers: true,
        bigNumberStrings: true,
      },
    }),
    RabbitMQModule.forRoot({
      uri: process.env.RABBITMQ_URI || 'amqp://tiffin_user:tiffin_pass@rabbitmq:5672',
      exchanges: [
        {
          name: RABBITMQ_CONSTANTS.EXCHANGE,
          type: 'topic',
          options: { durable: true },
        },
        {
          name: RABBITMQ_CONSTANTS.DEAD_LETTER_EXCHANGE,
          type: 'topic',
          options: { durable: true },
        },
      ],
      connectionInitOptions: { wait: true },
      prefetchCount: RABBITMQ_CONSTANTS.PREFETCH_COUNT,
      enableControllerDiscovery: true,
    }),
    HealthModule,
    AuthModule,
    UsersModule,
    BranchesModule,
    DevicesModule,
    IngestionModule,
    NormalizationModule,
    OrdersModule,
    NotificationsModule,
    EscalationModule,
    AnalyticsModule,
    PrintingModule,
  ],
  providers: [LoggerService, ConfigService],
})
export class AppModule implements NestModule {
  constructor(
    private configService: ConfigService,
    private logger: LoggerService
  ) {
    this.logger.info(`Application started in ${this.configService.nodeEnv} mode`, 'AppModule');
  }

  configure(consumer: MiddlewareConsumer): void {
    // Middleware configuration will go here
    // For example: correlation ID middleware, request logging, etc.
  }
}
