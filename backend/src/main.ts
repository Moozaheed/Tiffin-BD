import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { LoggerService } from './common/logger/logger.service';
import { JwtGuard, RolesGuard } from './common/guards';
import { LoggingInterceptor, ErrorInterceptor } from './common/interceptors';
import { Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const loggerService = app.get(LoggerService);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(loggerService),
    new ErrorInterceptor(loggerService),
  );

  // Global guards
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtGuard(reflector), new RolesGuard(reflector));

  const port = configService.appPort;
  const appName = configService.appName;

  await app.listen(port, '0.0.0.0');

  loggerService.info(
    `${appName} application listening on port ${port}`,
    'Bootstrap',
    { environment: configService.nodeEnv },
  );
}

bootstrap().catch((error) => {
  console.error('Application startup failed:', error);
  process.exit(1);
});
