import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Generic validation exception for input validation errors
 */
export class ValidationException extends HttpException {
  constructor(message: string, errors?: Record<string, unknown>) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        errors: errors || {},
        timestamp: new Date().toISOString(),
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * Database operation exception
 */
export class DatabaseException extends HttpException {
  constructor(message: string, details?: string) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Database operation failed',
        details: message,
        error: details || 'Internal Server Error',
        timestamp: new Date().toISOString(),
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

/**
 * Authentication failure exception
 */
export class AuthenticationException extends HttpException {
  constructor(message = 'Authentication failed') {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        message,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

/**
 * Authorization/permission failure exception
 */
export class AuthorizationException extends HttpException {
  constructor(message = 'Access denied') {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        message,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

/**
 * Resource not found exception
 */
export class NotFoundException extends HttpException {
  constructor(resource: string, identifier?: string) {
    const message = identifier ? `${resource} with ${identifier} not found` : `${resource} not found`;
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

/**
 * Conflict exception for duplicate resources
 */
export class ConflictException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.CONFLICT,
    );
  }
}
