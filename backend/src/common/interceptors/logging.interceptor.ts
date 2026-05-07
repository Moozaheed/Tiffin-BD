import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../logger/logger.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const correlationId = request.headers['x-correlation-id'] || uuid();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent');

    this.logger.setCorrelationId(correlationId);

    const startTime = Date.now();

    return next.handle().pipe(
      tap(
        (response) => {
          const duration = Date.now() - startTime;
          this.logger.info('Request completed successfully', 'LoggingInterceptor', {
            method,
            url,
            statusCode: context.switchToHttp().getResponse().statusCode,
            duration,
            ip,
            userAgent,
            correlationId,
          });
        },
        (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            'Request failed',
            error,
            'LoggingInterceptor',
            {
              method,
              url,
              statusCode: error.getStatus?.() || 500,
              duration,
              ip,
              userAgent,
              correlationId,
            },
          );
        },
      ),
    );
  }
}
