import { IsString, IsNotEmpty, IsObject, IsOptional, IsIn } from 'class-validator';

export class ThirdPartyWebhookDto {
  @IsObject()
  @IsNotEmpty()
  payload: any;
}

export class ChilliPosOrderDto {
  @IsObject()
  @IsNotEmpty()
  payload: any;

  @IsString()
  @IsOptional()
  api_key?: string;
}
