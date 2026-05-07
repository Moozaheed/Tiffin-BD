import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators';
import { HealthCheckService, HealthCheckResponse } from './health.service';

@Controller('health')
export class HealthCheckController {
  constructor(private healthCheckService: HealthCheckService) {}

  @Get()
  @Public()
  async getHealth(): Promise<HealthCheckResponse> {
    return this.healthCheckService.checkHealth();
  }

  @Get('live')
  @Public()
  async getLiveness(): Promise<{ status: string }> {
    return { status: 'alive' };
  }

  @Get('ready')
  @Public()
  async getReadiness(): Promise<HealthCheckResponse> {
    return this.healthCheckService.checkHealth();
  }
}
