import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [SharedModule, DatabaseModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
