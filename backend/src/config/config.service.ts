import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { EnvironmentVariables } from './env.validation';

@Injectable()
export class ConfigService {
  private config: EnvironmentVariables;

  constructor() {
    this.config = this.validateConfig();
  }

  private validateConfig(): EnvironmentVariables {
    const config = plainToClass(EnvironmentVariables, process.env, {
      enableImplicitConversion: true,
    });

    const errors = validateSync(config, { skipMissingProperties: false });
    if (errors.length > 0) {
      const errorMessages = errors
        .map((error) => `  - ${error.property}: ${Object.values(error.constraints || {}).join(', ')}`)
        .join('\n');

      throw new Error(
        `Configuration validation failed:\n${errorMessages}\n\nPlease check your .env file and ensure all required variables are set.`,
      );
    }

    return config;
  }

  get nodeEnv(): string {
    return this.config.NODE_ENV;
  }

  get appPort(): number {
    return this.config.APP_PORT;
  }

  get appName(): string {
    return this.config.APP_NAME;
  }

  get appVersion(): string {
    return this.config.APP_VERSION;
  }

  get logLevel(): string {
    return this.config.LOG_LEVEL;
  }

  get isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  get isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  // Database
  get dbHost(): string {
    return this.config.DB_HOST;
  }

  get dbPort(): number {
    return this.config.DB_PORT;
  }

  get dbUsername(): string {
    return this.config.DB_USERNAME;
  }

  get dbPassword(): string {
    return this.config.DB_PASSWORD;
  }

  get dbDatabase(): string {
    return this.config.DB_DATABASE;
  }

  // Redis
  get redisHost(): string {
    return this.config.REDIS_HOST;
  }

  get redisPort(): number {
    return this.config.REDIS_PORT;
  }

  get redisPassword(): string | undefined {
    return this.config.REDIS_PASSWORD;
  }

  // JWT
  get jwtSecret(): string {
    return this.config.JWT_SECRET;
  }

  get jwtExpiration(): number {
    return this.config.JWT_EXPIRATION;
  }

  get jwtRefreshSecret(): string {
    return this.config.JWT_REFRESH_SECRET;
  }

  get jwtRefreshExpiration(): number {
    return this.config.JWT_REFRESH_EXPIRATION;
  }

  // Logging
  get logFormat(): string {
    return this.config.LOG_FORMAT;
  }

  get logOutput(): string {
    return this.config.LOG_OUTPUT;
  }

  get logFilepath(): string {
    return this.config.LOG_FILEPATH;
  }

  // Connectors
  get foodpandaHmacSecret(): string | undefined {
    return this.config.FOODPANDA_HMAC_SECRET;
  }

  get foodiHmacSecret(): string | undefined {
    return this.config.FOODI_HMAC_SECRET;
  }

  get pathaoHmacSecret(): string | undefined {
    return this.config.PATHAO_HMAC_SECRET;
  }

  get chilliPosApiKey(): string | undefined {
    return this.config.CHILLI_POS_API_KEY;
  }

  get chilliPosApiUrl(): string | undefined {
    return this.config.CHILLI_POS_API_URL;
  }

  // RabbitMQ
  get rabbitmqUri(): string {
    return this.config.RABBITMQ_URI || 'amqp://guest:guest@localhost:5672';
  }

  // Features
  get enableHealthCheck(): boolean {
    return this.config.ENABLE_HEALTH_CHECK;
  }

  get enableSwagger(): boolean {
    return this.config.ENABLE_SWAGGER;
  }
}
