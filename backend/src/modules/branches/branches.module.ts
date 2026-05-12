import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { BranchesController } from './branches.controller';
import { BranchesService } from './branches.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [SharedModule, DatabaseModule],
  controllers: [BranchesController],
  providers: [BranchesService],
  exports: [BranchesService],
})
export class BranchesModule {}
