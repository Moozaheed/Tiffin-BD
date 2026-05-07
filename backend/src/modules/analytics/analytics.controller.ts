import {
  Controller,
  Get,
  Param,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../../common/decorators';
import { UserRole } from '../../common/constants';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('today')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.VIEWER,
  )
  async getTodaySummary(@Query('branchId') branchId?: string) {
    const summary = await this.analyticsService.getTodaySummary(branchId);
    return {
      statusCode: HttpStatus.OK,
      data: summary,
    };
  }

  @Get('branch/:branchId')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.VIEWER,
  )
  async getBranchSummary(@Param('branchId') branchId: string) {
    const summary = await this.analyticsService.getBranchSummary(branchId);
    return {
      statusCode: HttpStatus.OK,
      data: summary,
    };
  }

  @Get('response-time/:branchId')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.VIEWER,
  )
  async getResponseTime(
    @Param('branchId') branchId: string,
    @Query('days') days?: string,
  ) {
    const summary = await this.analyticsService.getResponseTime(
      branchId,
      days ? parseInt(days, 10) : undefined,
    );
    return {
      statusCode: HttpStatus.OK,
      data: summary,
    };
  }

  @Get('by-source')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.VIEWER,
  )
  async getOrdersBySource(
    @Query('branchId') branchId?: string,
    @Query('days') days?: string,
  ) {
    const data = await this.analyticsService.getOrdersBySource(
      branchId,
      days ? parseInt(days, 10) : undefined,
    );
    return {
      statusCode: HttpStatus.OK,
      data,
    };
  }
}
