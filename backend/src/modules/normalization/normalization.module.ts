import { Module } from '@nestjs/common';
import { NormalizationController } from './normalization.controller';
import { NormalizationService } from './normalization.service';
import { NormalizationConsumer } from './normalization.consumer';
import { BranchRoutingService } from './services/branch-routing.service';
import { DatabaseModule } from '../../database/database.module';
import { IngestionModule } from '../ingestion/ingestion.module';
import { LoggerService } from '../../common/logger/logger.service';

@Module({
  imports: [DatabaseModule, IngestionModule],
  controllers: [NormalizationController],
  providers: [
    NormalizationService,
    NormalizationConsumer,
    BranchRoutingService,
    LoggerService,
  ],
  exports: [NormalizationService, BranchRoutingService],
})
export class NormalizationModule {}
