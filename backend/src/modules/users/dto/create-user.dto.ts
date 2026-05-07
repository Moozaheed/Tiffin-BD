import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BranchRoleAssignmentDto {
  @IsUUID()
  @IsNotEmpty()
  branchId: string;

  @IsUUID()
  @IsNotEmpty()
  roleId: string;
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsUUID()
  @IsNotEmpty()
  primaryBranchId: string;

  @IsBoolean()
  @IsOptional()
  isSuperAdmin?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BranchRoleAssignmentDto)
  @IsOptional()
  branchRoles?: BranchRoleAssignmentDto[];
}
