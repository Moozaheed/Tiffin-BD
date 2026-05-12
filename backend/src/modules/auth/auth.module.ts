import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigService } from '../../config/config.service';
import { DatabaseModule } from '../../database/database.module';
import { SharedModule } from '../../shared/shared.module';
import { CsrfService } from '../../common/csrf/csrf.service';

@Module({
  imports: [
    DatabaseModule,
    SharedModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret:
        process.env.JWT_SECRET ||
        'your-secret-key-change-in-production-very-long-random-string-here',
      signOptions: { expiresIn: parseInt(process.env.JWT_EXPIRATION || '3600', 10) },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, CsrfService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
