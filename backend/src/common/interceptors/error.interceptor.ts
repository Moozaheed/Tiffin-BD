import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  constructor(private logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();

        if (error instanceof HttpException) {
          const status = error.getStatus();
          const message = error.getResponse();

          this.logger.warn('HTTP Exception', 'ErrorInterceptor', {
            status,
            message,
            url: request.url,
            method: request.method,
          });

          return throwError(() => error);
        }

        this.logger.error('Unhandled Exception', error, 'ErrorInterceptor', {
          url: request.url,
          method: request.method,
          statusCode: response.statusCode,
        });

        return throwError(() => new InternalServerErrorException('Internal server error'));
      }),
    );
  }
}
