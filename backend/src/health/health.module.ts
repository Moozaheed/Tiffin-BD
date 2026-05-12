import { Module } from '@nestjs/common';
import { HealthCheckService } from './health.service';
import { HealthCheckController } from './health.controller';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  providers: [HealthCheckService],
  controllers: [HealthCheckController],
})
export class HealthModule {}
