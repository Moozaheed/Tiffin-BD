import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto } from './dto';
import { Roles, CurrentUser } from '../../common/decorators';
import { UserRole } from '../../common/constants';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async create(@Body() createUserDto: CreateUserDto, @CurrentUser() actor: any) {
    const user = await this.usersService.create(createUserDto, actor.id);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'User created successfully',
      data: user,
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    const result = await this.usersService.findAll(page, limit, search);
    return {
      statusCode: HttpStatus.OK,
      message: 'Users retrieved',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('me')
  async getProfile(@CurrentUser() actor: any) {
    const user = await this.usersService.findOne(actor.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Profile retrieved',
      data: user,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User retrieved',
      data: user,
      timestamp: new Date().toISOString(),
    };
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() actor: any,
  ) {
    const user = await this.usersService.update(id, updateUserDto, actor.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User updated',
      data: user,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: any) {
    await this.usersService.remove(id, actor.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User deactivated',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('me/change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(@Body() changePasswordDto: ChangePasswordDto, @CurrentUser() actor: any) {
    await this.usersService.changePassword(actor.id, changePasswordDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Password changed successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':userId/branch-roles')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async assignBranchRole(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body('branchId', ParseUUIDPipe) branchId: string,
    @Body('roleId', ParseUUIDPipe) roleId: string,
    @CurrentUser() actor: any,
  ) {
    await this.usersService.assignBranchRole(userId, branchId, roleId, actor.id);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Branch role assigned',
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':userId/branch-roles')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async removeBranchRole(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body('branchId', ParseUUIDPipe) branchId: string,
    @Body('roleId', ParseUUIDPipe) roleId: string,
    @CurrentUser() actor: any,
  ) {
    await this.usersService.removeBranchRole(userId, branchId, roleId, actor.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Branch role removed',
      timestamp: new Date().toISOString(),
    };
  }
}
