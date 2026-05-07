import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidPayloadException extends HttpException {
  constructor(sourceType: string, details?: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'INVALID_PAYLOAD',
        message: `Invalid payload for source: ${sourceType}`,
        details,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class InvalidSignatureException extends HttpException {
  constructor(sourceType: string) {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        code: 'INVALID_SIGNATURE',
        message: `HMAC signature verification failed for source: ${sourceType}`,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class UnsupportedSourceException extends HttpException {
  constructor(sourceType: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'UNSUPPORTED_SOURCE',
        message: `Source type not supported: ${sourceType}`,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class DuplicateOrderException extends HttpException {
  constructor(idempotencyKey: string, originalOrderId?: string) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        code: 'DUPLICATE_ORDER',
        message: 'Order already processed',
        details: { idempotencyKey, originalOrderId },
        timestamp: new Date().toISOString(),
      },
      HttpStatus.CONFLICT,
    );
  }
}

export class RateLimitExceededException extends HttpException {
  constructor(limit: number, window: string, retryAfter: number) {
    super(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Too many requests. Max ${limit} per ${window}.`,
        details: { limit, window, retryAfter },
        timestamp: new Date().toISOString(),
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
