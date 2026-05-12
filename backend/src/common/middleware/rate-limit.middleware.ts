import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../logger/logger.service';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private requests = new Map<string, RateLimitRecord>();
  private readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  private readonly MAX_REQUESTS = 100; // per IP per window
  private readonly LOGIN_MAX_REQUESTS = 5; // stricter limit for login

  constructor(private readonly logger: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const ip = this.getClientIp(req);
    const isLoginRoute = req.path === '/auth/login';
    const maxRequests = isLoginRoute ? this.LOGIN_MAX_REQUESTS : this.MAX_REQUESTS;

    const record = this.requests.get(ip) || { count: 0, resetTime: Date.now() + this.WINDOW_MS };

    // Reset if window has passed
    if (Date.now() > record.resetTime) {
      record.count = 0;
      record.resetTime = Date.now() + this.WINDOW_MS;
    }

    record.count += 1;
    this.requests.set(ip, record);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count));
    res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());

    if (record.count > maxRequests) {
      this.logger.warn(`Rate limit exceeded for IP: ${ip}`, 'RateLimitMiddleware');
      res.status(429).json({
        statusCode: 429,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((record.resetTime - Date.now()) / 1000),
      });
      return;
    }

    next();
  }

  private getClientIp(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket.remoteAddress ||
      'unknown'
    );
  }
}
