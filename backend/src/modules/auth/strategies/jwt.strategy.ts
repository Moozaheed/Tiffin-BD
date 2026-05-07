import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '../../../config/config.service';
import { AuthenticationException } from '../../../common/exceptions';

export interface JwtPayload {
  sub: string;
  username: string;
  isSuperAdmin: boolean;
  roles: string[];
  branchIds: string[];
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub) {
      throw new AuthenticationException('Invalid token payload');
    }

    return {
      id: payload.sub,
      username: payload.username,
      isSuperAdmin: payload.isSuperAdmin,
      roles: payload.roles,
      branchIds: payload.branchIds,
    };
  }
}
