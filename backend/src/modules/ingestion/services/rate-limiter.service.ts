import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '../../../config/config.service';
import { LoggerService } from '../../../common/logger/logger.service';
import { RATE_LIMIT_CONSTANTS } from '../../../common/constants';

export interface RateLimitResult {
  allowed: boolean;
  sustainedRemaining: number;
  burstRemaining: number;
  retryAfterMs: number;
}

@Injectable()
export class RateLimiterService implements OnModuleInit, OnModuleDestroy {
  private redis: Redis;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  onModuleInit() {
    this.redis = new Redis({
      host: this.configService.redisHost,
      port: this.configService.redisPort,
      password: this.configService.redisPassword || undefined,
      retryStrategy: (times) => Math.min(times * 100, 3000),
    });
  }

  onModuleDestroy() {
    this.redis?.disconnect();
  }

  async checkAndRecord(sourceConnectorId: string): Promise<RateLimitResult> {
    const now = Date.now();
    const key = `${RATE_LIMIT_CONSTANTS.REDIS_KEY_PREFIX}${sourceConnectorId}`;

    try {
      await this.redis.zremrangebyscore(key, '-inf', now - RATE_LIMIT_CONSTANTS.SUSTAINED_WINDOW_MS);

      const sustainedCount = await this.redis.zcard(key);

      const burstWindowStart = now - RATE_LIMIT_CONSTANTS.BURST_WINDOW_MS;
      const burstCount = await this.redis.zcount(key, burstWindowStart, '+inf');

      if (sustainedCount >= RATE_LIMIT_CONSTANTS.SUSTAINED_LIMIT) {
        const oldestEntry = await this.redis.zrangebyscore(key, '-inf', '+inf', 'LIMIT', 0, 1);
        const retryAfterMs = oldestEntry.length > 0
          ? RATE_LIMIT_CONSTANTS.SUSTAINED_WINDOW_MS - (now - Number(oldestEntry[0]))
          : RATE_LIMIT_CONSTANTS.SUSTAINED_WINDOW_MS;

        return {
          allowed: false,
          sustainedRemaining: 0,
          burstRemaining: Math.max(0, RATE_LIMIT_CONSTANTS.BURST_LIMIT - burstCount),
          retryAfterMs: Math.max(1000, retryAfterMs),
        };
      }

      if (burstCount >= RATE_LIMIT_CONSTANTS.BURST_LIMIT) {
        return {
          allowed: false,
          sustainedRemaining: RATE_LIMIT_CONSTANTS.SUSTAINED_LIMIT - sustainedCount,
          burstRemaining: 0,
          retryAfterMs: RATE_LIMIT_CONSTANTS.BURST_WINDOW_MS,
        };
      }

      const uniqueId = `${now}:${Math.random().toString(36).slice(2, 8)}`;
      await this.redis.zadd(key, now, uniqueId);
      await this.redis.expire(key, Math.ceil(RATE_LIMIT_CONSTANTS.SUSTAINED_WINDOW_MS / 1000) + 1);

      return {
        allowed: true,
        sustainedRemaining: RATE_LIMIT_CONSTANTS.SUSTAINED_LIMIT - sustainedCount - 1,
        burstRemaining: RATE_LIMIT_CONSTANTS.BURST_LIMIT - burstCount - 1,
        retryAfterMs: 0,
      };
    } catch {
      this.logger.warn('Redis unavailable for rate limiting, allowing request', 'RateLimiterService');
      return { allowed: true, sustainedRemaining: -1, burstRemaining: -1, retryAfterMs: 0 };
    }
  }
}
