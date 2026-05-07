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
import { BranchesService } from './branches.service';
import { CreateBranchDto, UpdateBranchDto } from './dto';
import { Roles, CurrentUser } from '../../common/decorators';
import { UserRole } from '../../common/constants';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async create(@Body() createBranchDto: CreateBranchDto, @CurrentUser() actor: any) {
    const branch = await this.branchesService.create(createBranchDto, actor.id);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Branch created',
      data: branch,
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    const result = await this.branchesService.findAll(page, limit);
    return {
      statusCode: HttpStatus.OK,
      message: 'Branches retrieved',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('active')
  async findActive() {
    const branches = await this.branchesService.findActive();
    return {
      statusCode: HttpStatus.OK,
      message: 'Active branches retrieved',
      data: branches,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const branch = await this.branchesService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Branch retrieved',
      data: branch,
      timestamp: new Date().toISOString(),
    };
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBranchDto: UpdateBranchDto,
    @CurrentUser() actor: any,
  ) {
    const branch = await this.branchesService.update(id, updateBranchDto, actor.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Branch updated',
      data: branch,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: any) {
    await this.branchesService.remove(id, actor.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Branch deactivated',
      timestamp: new Date().toISOString(),
    };
  }

  @Put(':id/activate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async activate(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: any) {
    const branch = await this.branchesService.activate(id, actor.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Branch activated',
      data: branch,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id/metadata')
  async getMetadata(@Param('id', ParseUUIDPipe) id: string) {
    const metadata = await this.branchesService.getMetadata(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Branch metadata retrieved',
      data: metadata,
      timestamp: new Date().toISOString(),
    };
  }

  @Put(':id/metadata')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async updateMetadata(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() metadata: Record<string, any>,
    @CurrentUser() actor: any,
  ) {
    const branch = await this.branchesService.updateMetadata(id, metadata, actor.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Branch metadata updated',
      data: branch,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id/users')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.BRANCH_MANAGER)
  async getBranchUsers(@Param('id', ParseUUIDPipe) id: string) {
    const users = await this.branchesService.getBranchUsers(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Branch users retrieved',
      data: users,
      timestamp: new Date().toISOString(),
    };
  }
}
