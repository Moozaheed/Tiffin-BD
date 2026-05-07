import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '../../config/config.service';
import { LoggerService } from '../../common/logger/logger.service';
import { UsersRepository, UserBranchRolesRepository } from '../../database/repositories';
import { AuthenticationException } from '../../common/exceptions';
import { LoginDto, AuthResponseDto } from './dto';
import { JwtPayload } from './strategies/jwt.strategy';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  private loginAttempts = new Map<string, { count: number; lockedUntil: Date | null }>();

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly userBranchRolesRepository: UserBranchRolesRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { username, password } = loginDto;

    this.checkLockout(username);

    const user = await this.usersRepository.findOne({
      where: [{ username }, { email: username }],
    });

    if (!user || !user.isActive) {
      this.recordFailedAttempt(username);
      throw new AuthenticationException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      this.recordFailedAttempt(username);
      throw new AuthenticationException('Invalid credentials');
    }

    this.clearLoginAttempts(username);

    const branchRoles = await this.userBranchRolesRepository.findUserBranchRoles(user.id);

    const roles = branchRoles.map((ubr) => ubr.role.code);
    const branchIds = branchRoles.map((ubr) => ubr.branchId);

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      isSuperAdmin: user.isSuperAdmin,
      roles: [...new Set(roles)],
      branchIds: [...new Set(branchIds)],
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.jwtRefreshSecret,
      expiresIn: this.configService.jwtRefreshExpiration,
    });

    user.lastLoginAt = new Date();
    await this.usersRepository.save(user);

    this.logger.info(`User logged in: ${user.username}`, 'AuthService', { userId: user.id });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.jwtExpiration,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        isSuperAdmin: user.isSuperAdmin,
        primaryBranchId: user.primaryBranchId,
        roles: branchRoles.map((ubr) => ({
          branchId: ubr.branchId,
          branchName: ubr.branch?.name || '',
          roleCode: ubr.role.code,
          roleName: ubr.role.name,
        })),
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.jwtRefreshSecret,
      });

      const user = await this.usersRepository.findOne({ where: { id: payload.sub } });
      if (!user || !user.isActive) {
        throw new AuthenticationException('Invalid refresh token');
      }

      const branchRoles = await this.userBranchRolesRepository.findUserBranchRoles(user.id);
      const roles = branchRoles.map((ubr) => ubr.role.code);
      const branchIds = branchRoles.map((ubr) => ubr.branchId);

      const newPayload: JwtPayload = {
        sub: user.id,
        username: user.username,
        isSuperAdmin: user.isSuperAdmin,
        roles: [...new Set(roles)],
        branchIds: [...new Set(branchIds)],
      };

      const accessToken = this.jwtService.sign(newPayload);

      this.logger.info(`Token refreshed for: ${user.username}`, 'AuthService', { userId: user.id });

      return {
        accessToken,
        expiresIn: this.configService.jwtExpiration,
      };
    } catch (error) {
      if (error instanceof AuthenticationException) throw error;
      throw new AuthenticationException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    this.logger.info(`User logged out`, 'AuthService', { userId });
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private checkLockout(username: string): void {
    const attempts = this.loginAttempts.get(username);
    if (attempts?.lockedUntil && attempts.lockedUntil > new Date()) {
      const remainingMs = attempts.lockedUntil.getTime() - Date.now();
      const remainingMin = Math.ceil(remainingMs / 60000);
      throw new AuthenticationException(
        `Account locked due to too many failed attempts. Try again in ${remainingMin} minutes.`,
      );
    }
  }

  private recordFailedAttempt(username: string): void {
    const attempts = this.loginAttempts.get(username) || { count: 0, lockedUntil: null };
    attempts.count += 1;

    if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
      attempts.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
      this.logger.warn(`Account locked: ${username} after ${attempts.count} failed attempts`, 'AuthService');
    }

    this.loginAttempts.set(username, attempts);
  }

  private clearLoginAttempts(username: string): void {
    this.loginAttempts.delete(username);
  }
}
