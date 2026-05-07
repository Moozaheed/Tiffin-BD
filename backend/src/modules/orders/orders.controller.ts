import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Roles, CurrentUser } from '../../common/decorators';
import { UserRole } from '../../common/constants';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.OPERATOR,
    UserRole.VIEWER,
  )
  async listOrders(
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.ordersService.listOrders({
      branchId,
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    return {
      statusCode: HttpStatus.OK,
      data: result.data,
      total: result.total,
    };
  }

  @Get(':id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.OPERATOR,
    UserRole.VIEWER,
  )
  async getOrder(@Param('id') id: string) {
    const order = await this.ordersService.getOrder(id);
    return {
      statusCode: HttpStatus.OK,
      data: order,
    };
  }

  @Get('by-canonical/:canonicalOrderNo')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.OPERATOR,
  )
  async getOrderByCanonical(@Param('canonicalOrderNo') canonicalOrderNo: string) {
    const order = await this.ordersService.getOrderByCanonical(canonicalOrderNo);
    return {
      statusCode: HttpStatus.OK,
      data: order,
    };
  }

  @Get('branch/:branchId/pending')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.BRANCH_MANAGER,
    UserRole.OPERATOR,
  )
  async getPendingOrders(@Param('branchId') branchId: string) {
    const orders = await this.ordersService.getPendingOrders(branchId);
    return {
      statusCode: HttpStatus.OK,
      data: orders,
      count: orders.length,
    };
  }

  @Post(':id/accept')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.OPERATOR)
  @HttpCode(HttpStatus.OK)
  async acceptOrder(@Param('id') id: string, @CurrentUser() user: any) {
    const result = await this.ordersService.acceptOrder(id, user.sub);
    return {
      statusCode: HttpStatus.OK,
      message: 'Order accepted',
      ...result,
    };
  }

  @Post(':id/prepare')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.OPERATOR)
  @HttpCode(HttpStatus.OK)
  async markPreparing(@Param('id') id: string) {
    const result = await this.ordersService.markPreparing(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Order marked as preparing',
      ...result,
    };
  }

  @Post(':id/ready')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.OPERATOR)
  @HttpCode(HttpStatus.OK)
  async markReady(@Param('id') id: string) {
    const result = await this.ordersService.markReady(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Order marked as ready',
      ...result,
    };
  }

  @Post(':id/escalate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @HttpCode(HttpStatus.OK)
  async escalateOrder(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    const result = await this.ordersService.escalateOrder(id, reason);
    return {
      statusCode: HttpStatus.OK,
      message: 'Order escalated',
      ...result,
    };
  }

  @Post(':id/complete')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.OPERATOR)
  @HttpCode(HttpStatus.OK)
  async completeOrder(@Param('id') id: string) {
    const result = await this.ordersService.completeOrder(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Order completed',
      ...result,
    };
  }

  @Post(':id/cancel')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  @HttpCode(HttpStatus.OK)
  async cancelOrder(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    const result = await this.ordersService.cancelOrder(id, reason);
    return {
      statusCode: HttpStatus.OK,
      message: 'Order cancelled',
      ...result,
    };
  }
}
