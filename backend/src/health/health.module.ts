import { Module } from '@nestjs/common';
import { HealthCheckService } from './health.service';
import { HealthCheckController } from './health.controller';
import { LoggerService } from '../common/logger/logger.service';

@Module({
  providers: [HealthCheckService, LoggerService],
  controllers: [HealthCheckController],
})
export class HealthModule {}
