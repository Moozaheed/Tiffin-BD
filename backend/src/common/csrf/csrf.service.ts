import { Injectable } from '@nestjs/common';
import { createHmac, randomBytes } from 'crypto';

@Injectable()
export class CsrfService {
  private tokens = new Map<string, { token: string; createdAt: Date }>();
  private readonly TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Generate a new CSRF token
   */
  generateToken(sessionId: string): string {
    // Clean expired tokens
    this.cleanupExpiredTokens();

    const randomPart = randomBytes(32).toString('hex');
    const timestamp = Date.now().toString();
    const token = createHmac('sha256', process.env.CSRF_SECRET || 'csrf-secret-key')
      .update(`${randomPart}${timestamp}`)
      .digest('hex');

    this.tokens.set(sessionId, {
      token,
      createdAt: new Date(),
    });

    return token;
  }

  /**
   * Verify a CSRF token
   */
  verifyToken(sessionId: string, token: string): boolean {
    const storedToken = this.tokens.get(sessionId);

    if (!storedToken) {
      return false;
    }

    const isExpired = Date.now() - storedToken.createdAt.getTime() > this.TOKEN_EXPIRY_MS;
    if (isExpired) {
      this.tokens.delete(sessionId);
      return false;
    }

    const isValid = storedToken.token === token;
    if (isValid) {
      // Consume the token (one-time use)
      this.tokens.delete(sessionId);
    }

    return isValid;
  }

  /**
   * Clean up expired tokens
   */
  private cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [sessionId, { createdAt }] of this.tokens.entries()) {
      if (now - createdAt.getTime() > this.TOKEN_EXPIRY_MS) {
        this.tokens.delete(sessionId);
      }
    }
  }
}
