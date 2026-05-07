import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { DeviceType } from '../../../common/constants';

export class RegisterDeviceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(DeviceType)
  @IsNotEmpty()
  deviceType: DeviceType;

  @IsUUID()
  @IsNotEmpty()
  branchId: string;

  @IsString()
  @IsOptional()
  fcmToken?: string;

  @IsString()
  @IsOptional()
  serialNumber?: string;

  @IsString()
  @IsOptional()
  imei?: string;
}

export class UpdateFcmTokenDto {
  @IsString()
  @IsNotEmpty()
  fcmToken: string;
}
