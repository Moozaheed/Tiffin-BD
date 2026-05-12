import { Module } from '@nestjs/common';
import { LoggerService } from '../common/logger/logger.service';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [ConfigModule],
  providers: [LoggerService],
  exports: [LoggerService, ConfigModule],
})
export class SharedModule {}
