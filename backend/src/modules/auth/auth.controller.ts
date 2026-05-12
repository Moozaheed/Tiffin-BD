import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto } from './dto';
import { Public, CurrentUser } from '../../common/decorators';
import { CsrfService } from '../../common/csrf/csrf.service';
import { CsrfGuard } from '../../common/csrf/csrf.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly csrfService: CsrfService,
  ) {}

  @Public()
  @Get('csrf-token')
  @HttpCode(HttpStatus.OK)
  getCsrfToken(@Req() req: any) {
    const sessionId = req.sessionID || req.headers['x-session-id'] || `session-${Date.now()}`;
    const csrfToken = this.csrfService.generateToken(sessionId);
    return {
      statusCode: HttpStatus.OK,
      data: { csrfToken, sessionId },
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @UseGuards(CsrfGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Login successful',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    const result = await this.authService.refreshToken(refreshTokenDto.refreshToken);
    return {
      statusCode: HttpStatus.OK,
      message: 'Token refreshed',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: any) {
    await this.authService.logout(user.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Logout successful',
      timestamp: new Date().toISOString(),
    };
  }
}
