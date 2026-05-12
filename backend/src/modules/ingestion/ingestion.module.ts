import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { IdempotencyService } from './services/idempotency.service';
import { RateLimiterService } from './services/rate-limiter.service';
import { ConnectorRegistry } from './connectors/connector-registry';
import { WebsiteConnector } from './connectors/website.connector';
import { FoodpandaConnector } from './connectors/foodpanda.connector';
import { FoodiConnector } from './connectors/foodi.connector';
import { PathaoConnector } from './connectors/pathao.connector';
import { ChilliPosConnector } from './connectors/chilli-pos.connector';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [SharedModule, DatabaseModule],
  controllers: [IngestionController],
  providers: [
    IngestionService,
    IdempotencyService,
    RateLimiterService,
    ConnectorRegistry,
    WebsiteConnector,
    FoodpandaConnector,
    FoodiConnector,
    PathaoConnector,
    ChilliPosConnector,
  ],
  exports: [IngestionService, ConnectorRegistry],
})
export class IngestionModule {}
