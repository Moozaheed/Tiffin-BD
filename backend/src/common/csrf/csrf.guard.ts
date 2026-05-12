import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { CsrfService } from './csrf.service';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly csrfService: CsrfService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Skip CSRF check for GET requests and public endpoints
    if (request.method === 'GET') {
      return true;
    }

    const sessionId = request.sessionID || request.headers['x-session-id'];
    const csrfToken = request.headers['x-csrf-token'] || request.body?.csrfToken;

    if (!sessionId || !csrfToken) {
      throw new BadRequestException('Missing CSRF token or session ID');
    }

    const isValid = this.csrfService.verifyToken(sessionId, csrfToken);
    if (!isValid) {
      throw new BadRequestException('Invalid or expired CSRF token');
    }

    return true;
  }
}
