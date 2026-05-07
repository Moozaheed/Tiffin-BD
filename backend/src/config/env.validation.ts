import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

enum Environment {
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
}

enum LogLevel {
  Debug = 'debug',
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
  Fatal = 'fatal',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsNotEmpty()
  APP_PORT: number = 3000;

  @IsString()
  @IsNotEmpty()
  APP_NAME: string = 'TiffinBD';

  @IsString()
  @IsNotEmpty()
  APP_VERSION: string = '1.0.0';

  @IsEnum(LogLevel)
  @IsOptional()
  LOG_LEVEL: LogLevel = LogLevel.Info;

  // Database
  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @IsNumber()
  @IsNotEmpty()
  DB_PORT: number;

  @IsString()
  @IsNotEmpty()
  DB_USERNAME: string;

  @IsString()
  @IsNotEmpty()
  DB_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  DB_DATABASE: string;

  // Redis
  @IsString()
  @IsNotEmpty()
  REDIS_HOST: string = 'localhost';

  @IsNumber()
  @IsNotEmpty()
  REDIS_PORT: number = 6379;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string;

  // JWT
  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsNumber()
  @IsNotEmpty()
  JWT_EXPIRATION: number = 3600;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET: string;

  @IsNumber()
  @IsNotEmpty()
  JWT_REFRESH_EXPIRATION: number = 604800;

  // Logging
  @IsString()
  @IsOptional()
  LOG_FORMAT: string = 'json';

  @IsString()
  @IsOptional()
  LOG_OUTPUT: string = 'console';

  @IsString()
  @IsOptional()
  LOG_FILEPATH: string = '/var/log/tiffinbd/';

  // Connector Secrets
  @IsString()
  @IsOptional()
  FOODPANDA_HMAC_SECRET?: string;

  @IsString()
  @IsOptional()
  FOODI_HMAC_SECRET?: string;

  @IsString()
  @IsOptional()
  PATHAO_HMAC_SECRET?: string;

  @IsString()
  @IsOptional()
  CHILLI_POS_API_KEY?: string;

  @IsString()
  @IsOptional()
  CHILLI_POS_API_URL?: string;

  // RabbitMQ
  @IsString()
  @IsOptional()
  RABBITMQ_URI?: string = 'amqp://guest:guest@localhost:5672';

  // Feature Flags
  @IsOptional()
  ENABLE_HEALTH_CHECK: boolean = true;

  @IsOptional()
  ENABLE_SWAGGER: boolean = true;
}
