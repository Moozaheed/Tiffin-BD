import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  IsObject,
  IsEmail,
  IsUUID,
  ValidateNested,
  ArrayMinSize,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class WebsiteOrderCustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;
}

export class WebsiteOrderItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class WebsiteOrderDto {
  @IsString()
  @IsNotEmpty()
  order_id: string;

  @IsObject()
  @ValidateNested()
  @Type(() => WebsiteOrderCustomerDto)
  customer: WebsiteOrderCustomerDto;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => WebsiteOrderItemDto)
  items: WebsiteOrderItemDto[];

  @IsNumber()
  @Min(0.01)
  total: number;

  @IsString()
  @IsOptional()
  payment_method?: string;

  @IsString()
  @IsOptional()
  special_instructions?: string;

  @IsUUID()
  @IsOptional()
  branch_id?: string;

  @IsString()
  @IsOptional()
  created_at?: string;
}
