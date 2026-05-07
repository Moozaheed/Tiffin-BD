import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NormalizationService } from './normalization.service';
import { Roles } from '../../common/decorators';
import { UserRole } from '../../common/constants';

@Controller('normalization')
export class NormalizationController {
  constructor(private readonly normalizationService: NormalizationService) {}

  @Post('enqueue/:rawOrderId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.ACCEPTED)
  async enqueueOrder(@Param('rawOrderId') rawOrderId: string) {
    const jobId = await this.normalizationService.enqueueRawOrder(rawOrderId);
    return {
      statusCode: HttpStatus.ACCEPTED,
      message: 'Order enqueued for normalization',
      jobId,
    };
  }

  @Post('reprocess')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async reprocessFailed(@Query('limit') limit?: string) {
    const count = await this.normalizationService.reprocessFailedOrders(
      limit ? parseInt(limit, 10) : undefined,
    );
    return {
      statusCode: HttpStatus.OK,
      message: `Re-enqueued ${count} failed orders`,
      reprocessedCount: count,
    };
  }

  @Get('errors')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  async getErrors(@Query('branchId') branchId?: string) {
    const errors = await this.normalizationService.getNormalizationErrors(branchId);
    return {
      statusCode: HttpStatus.OK,
      data: errors,
      count: errors.length,
    };
  }
}
