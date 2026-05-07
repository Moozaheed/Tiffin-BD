import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { DatabaseModule } from '../../database/database.module';
import { LoggerService } from '../../common/logger/logger.service';

@Module({
  imports: [DatabaseModule],
  controllers: [OrdersController],
  providers: [OrdersService, LoggerService],
  exports: [OrdersService],
})
export class OrdersModule {}
