import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { RegisterDeviceDto, UpdateFcmTokenDto } from './dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { UserRole } from '../../common/constants';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post('register')
  async register(@Body() registerDeviceDto: RegisterDeviceDto, @CurrentUser() actor: any) {
    const device = await this.devicesService.register(registerDeviceDto, actor.id);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Device registered',
      data: device,
      timestamp: new Date().toISOString(),
    };
  }

  @Put(':id/fcm-token')
  async updateFcmToken(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFcmTokenDto: UpdateFcmTokenDto,
    @CurrentUser() actor: any,
  ) {
    const device = await this.devicesService.updateFcmToken(id, updateFcmTokenDto, actor.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'FCM token updated',
      data: device,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('my-devices')
  async findMyDevices(@CurrentUser() actor: any) {
    const devices = await this.devicesService.findUserDevices(actor.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Devices retrieved',
      data: devices,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('branch/:branchId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  async findBranchDevices(@Param('branchId', ParseUUIDPipe) branchId: string) {
    const devices = await this.devicesService.findBranchDevices(branchId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Branch devices retrieved',
      data: devices,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deactivate(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: any) {
    await this.devicesService.deactivate(id, actor.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Device deactivated',
      timestamp: new Date().toISOString(),
    };
  }
}
