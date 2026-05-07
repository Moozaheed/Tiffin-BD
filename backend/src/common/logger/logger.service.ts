import { Injectable, LogLevel as NestLogLevel } from '@nestjs/common';
import * as bunyan from 'bunyan';
import { v4 as uuid } from 'uuid';

@Injectable()
export class LoggerService {
  private logger: bunyan;
  private correlationId: string;

  constructor(name = 'TiffinBD', logLevel = 'info') {
    this.correlationId = uuid();
    this.logger = bunyan.createLogger({
      name,
      level: (logLevel as unknown) as bunyan.LogLevel,
      serializers: bunyan.stdSerializers,
      streams: [
        {
          stream: process.stdout,
          level: (logLevel as unknown) as bunyan.LogLevel,
        },
      ],
    });
  }

  setCorrelationId(correlationId: string): void {
    this.correlationId = correlationId;
  }

  getCorrelationId(): string {
    return this.correlationId;
  }

  private getContext(context?: string): Record<string, unknown> {
    return {
      correlationId: this.correlationId,
      context: context || 'Application',
      timestamp: new Date().toISOString(),
    };
  }

  debug(message: string, context?: string, meta?: Record<string, unknown>): void {
    this.logger.debug({ ...this.getContext(context), ...meta }, message);
  }

  info(message: string, context?: string, meta?: Record<string, unknown>): void {
    this.logger.info({ ...this.getContext(context), ...meta }, message);
  }

  warn(message: string, context?: string, meta?: Record<string, unknown>): void {
    this.logger.warn({ ...this.getContext(context), ...meta }, message);
  }

  error(message: string, error?: Error | string, context?: string, meta?: Record<string, unknown>): void {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    this.logger.error(
      {
        ...this.getContext(context),
        ...meta,
        err: bunyan.stdSerializers.err(errorObj),
      },
      message,
    );
  }

  fatal(message: string, error?: Error | string, context?: string, meta?: Record<string, unknown>): void {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    this.logger.fatal(
      {
        ...this.getContext(context),
        ...meta,
        err: bunyan.stdSerializers.err(errorObj),
      },
      message,
    );
  }

  /**
   * NestJS Logger compatibility method
   */
  log(message: string, context?: string): void {
    this.info(message, context);
  }
}
