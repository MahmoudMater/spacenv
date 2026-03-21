import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

export interface AuthTokenPayload {
  sub: string;
  email: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private accessSecret(): string {
    return (
      this.config.get<string>('JWT_ACCESS_SECRET') ??
      'dev-access-secret-change-me'
    );
  }

  private refreshSecret(): string {
    return (
      this.config.get<string>('JWT_REFRESH_SECRET') ??
      'dev-refresh-secret-change-me'
    );
  }

  generateAccessToken(payload: AuthTokenPayload): string {
    return this.jwt.sign(
      { sub: payload.sub, email: payload.email },
      {
        secret: this.accessSecret(),
        expiresIn: this.parseExpiresToSeconds(
          this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m',
        ),
      },
    );
  }

  generateRefreshToken(payload: AuthTokenPayload): string {
    return this.jwt.sign(
      { sub: payload.sub, email: payload.email },
      {
        secret: this.refreshSecret(),
        expiresIn: this.parseExpiresToSeconds(
          this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d',
        ),
      },
    );
  }

  /** Parses env like 15m, 7d, or plain seconds into a numeric JWT exp. */
  private parseExpiresToSeconds(raw: string): number {
    const d = /^(\d+)d$/i.exec(raw);
    if (d) {
      return Number(d[1]) * 24 * 60 * 60;
    }
    const m = /^(\d+)m$/i.exec(raw);
    if (m) {
      return Number(m[1]) * 60;
    }
    const h = /^(\d+)h$/i.exec(raw);
    if (h) {
      return Number(h[1]) * 60 * 60;
    }
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : 15 * 60;
  }

  verifyAccessToken(token: string): AuthTokenPayload {
    return this.jwt.verify<AuthTokenPayload>(token, {
      secret: this.accessSecret(),
    });
  }

  verifyRefreshToken(token: string): AuthTokenPayload {
    return this.jwt.verify<AuthTokenPayload>(token, {
      secret: this.refreshSecret(),
    });
  }

  async hashToken(token: string): Promise<string> {
    return bcrypt.hash(token, 10);
  }

  async compareToken(token: string, hash: string): Promise<boolean> {
    return bcrypt.compare(token, hash);
  }

  refreshCookieMaxAgeMs(): number {
    const raw = this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
    const d = /^(\d+)d$/i.exec(raw);
    if (d) {
      return Number(d[1]) * 24 * 60 * 60 * 1000;
    }
    const m = /^(\d+)m$/i.exec(raw);
    if (m) {
      return Number(m[1]) * 60 * 1000;
    }
    return 7 * 24 * 60 * 60 * 1000;
  }

  getCookieOptions(type: 'access' | 'refresh') {
    const isProduction = process.env.NODE_ENV === 'production';
    const maxAge =
      type === 'access'
        ? 15 * 60 * 1000
        : this.refreshCookieMaxAgeMs();

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
      maxAge,
      path: '/',
    };
  }
}
