import { IsString, IsNotEmpty, IsOptional, IsEmail, IsObject, IsEnum, Matches } from 'class-validator';
import { BranchStatus } from '../../../common/constants';

export class CreateBranchDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9_-]+$/, { message: 'Code must be uppercase alphanumeric with dashes/underscores' })
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsEnum(BranchStatus)
  @IsOptional()
  status?: BranchStatus;

  @IsObject()
  @IsOptional()
  metadataJson?: Record<string, any>;
}
