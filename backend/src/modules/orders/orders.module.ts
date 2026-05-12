import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { DatabaseModule } from '../../database/database.module';
import { LoggerService } from '../../common/logger/logger.service';

@Module({
  imports: [SharedModule, DatabaseModule],
  controllers: [OrdersController],
  providers: [OrdersService, LoggerService],
  exports: [OrdersService],
})
export class OrdersModule {}
