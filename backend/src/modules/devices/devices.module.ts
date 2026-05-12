import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [SharedModule, DatabaseModule],
  controllers: [DevicesController],
  providers: [DevicesService],
  exports: [DevicesService],
})
export class DevicesModule {}
