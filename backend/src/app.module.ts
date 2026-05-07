import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigService } from './config/config.service';
import { ConfigModule as ConfigModuleCustom } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { LoggerService } from './common/logger/logger.service';
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
import { RABBITMQ_CONSTANTS } from './common/constants';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ConfigModuleCustom,
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.rabbitmqUri,
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
    }),
    DatabaseModule,
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
  constructor(private configService: ConfigService, private logger: LoggerService) {
    this.logger.info(
      `Application started in ${this.configService.nodeEnv} mode`,
      'AppModule',
    );
  }

  configure(consumer: MiddlewareConsumer): void {
    // Middleware configuration will go here
    // For example: correlation ID middleware, request logging, etc.
  }
}
