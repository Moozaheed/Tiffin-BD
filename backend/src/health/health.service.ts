import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { LoggerService } from '../common/logger/logger.service';
import { ConfigService } from '../config/config.service';

export interface ServiceHealth {
  status: 'up' | 'down';
  latency: number;
  message?: string;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    database: ServiceHealth;
    redis?: ServiceHealth;
    system: ServiceHealth;
  };
}

@Injectable()
export class HealthCheckService {
  private startTime = Date.now();

  constructor(
    private dataSource: DataSource,
    private logger: LoggerService,
    private configService: ConfigService,
  ) {}

  async checkHealth(): Promise<HealthCheckResponse> {
    const timestamp = new Date().toISOString();
    const uptime = Date.now() - this.startTime;

    const databaseHealth = await this.checkDatabase();
    const systemHealth = this.checkSystem();

    const allHealthy = databaseHealth.status === 'up' && systemHealth.status === 'up';
    const status = allHealthy ? 'healthy' : 'degraded';

    this.logger.info('Health check completed', 'HealthCheckService', {
      status,
      databaseStatus: databaseHealth.status,
      systemStatus: systemHealth.status,
    });

    return {
      status,
      timestamp,
      uptime,
      services: {
        database: databaseHealth,
        system: systemHealth,
      },
    };
  }

  private async checkDatabase(): Promise<ServiceHealth> {
    const startTime = Date.now();
    try {
      await this.dataSource.query('SELECT 1');
      const latency = Date.now() - startTime;
      return {
        status: 'up',
        latency,
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      this.logger.error('Database health check failed', error, 'HealthCheckService');
      return {
        status: 'down',
        latency,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private checkSystem(): ServiceHealth {
    const startTime = Date.now();
    try {
      const uptime = process.uptime();
      const memoryUsage = process.memoryUsage();

      if (memoryUsage.heapUsed > memoryUsage.heapTotal * 0.9) {
        this.logger.warn('High memory usage detected', 'HealthCheckService', {
          heapUsed: memoryUsage.heapUsed,
          heapTotal: memoryUsage.heapTotal,
        });
      }

      const latency = Date.now() - startTime;
      return {
        status: 'up',
        latency,
        message: `Uptime: ${uptime}s, Memory: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
      };
    } catch (error) {
      this.logger.error('System health check failed', error, 'HealthCheckService');
      return {
        status: 'down',
        latency: Date.now() - startTime,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
