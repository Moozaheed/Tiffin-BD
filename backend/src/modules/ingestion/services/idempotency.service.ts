import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '../../../config/config.service';
import { RawOrdersRepository } from '../../../database/repositories';
import { LoggerService } from '../../../common/logger/logger.service';
import { IDEMPOTENCY_CONSTANTS } from '../../../common/constants';

@Injectable()
export class IdempotencyService implements OnModuleInit, OnModuleDestroy {
  private redis: Redis;

  constructor(
    private readonly rawOrdersRepository: RawOrdersRepository,
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

    this.redis.on('error', (err) => {
      this.logger.warn(`Redis connection error: ${err.message}`, 'IdempotencyService');
    });
  }

  onModuleDestroy() {
    this.redis?.disconnect();
  }

  async checkIfProcessed(sourceConnectorId: string, idempotencyKey: string): Promise<string | null> {
    const cacheKey = `${IDEMPOTENCY_CONSTANTS.REDIS_KEY_PREFIX}${sourceConnectorId}:${idempotencyKey}`;

    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return cached;
    } catch {
      this.logger.warn('Redis unavailable for idempotency check, falling back to DB', 'IdempotencyService');
    }

    const existing = await this.rawOrdersRepository.findByIdempotencyKey(sourceConnectorId, idempotencyKey);
    if (existing) {
      try {
        await this.redis.setex(cacheKey, IDEMPOTENCY_CONSTANTS.TTL_SECONDS, existing.id);
      } catch {}
      return existing.id;
    }

    return null;
  }

  async markAsProcessed(sourceConnectorId: string, idempotencyKey: string, rawOrderId: string): Promise<void> {
    const cacheKey = `${IDEMPOTENCY_CONSTANTS.REDIS_KEY_PREFIX}${sourceConnectorId}:${idempotencyKey}`;
    try {
      await this.redis.setex(cacheKey, IDEMPOTENCY_CONSTANTS.TTL_SECONDS, rawOrderId);
    } catch {
      this.logger.warn('Failed to cache idempotency key in Redis', 'IdempotencyService');
    }
  }

  async isDuplicate(sourceConnectorId: string, sourceOrderId: string): Promise<boolean> {
    const existing = await this.rawOrdersRepository.findByExternalOrderId(sourceOrderId, sourceConnectorId);
    return !!existing;
  }
}
