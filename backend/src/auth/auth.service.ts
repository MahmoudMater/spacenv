import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import type { AuthTokenPayload } from './token.service';
import { TokenService } from './token.service';

export type OAuthUserInput = {
  email: string;
  name: string;
  avatarUrl?: string | null;
  provider: string;
  providerId: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async register(dto: RegisterDto, res: Response, req: Request) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        name: dto.name,
        passwordHash,
        provider: 'local',
      },
    });

    await this.issueAuthSession(user, res, req);
    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    });
  }

  async login(dto: LoginDto, res: Response, req: Request) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.issueAuthSession(user, res, req);
    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    });
  }

  async handleOAuthLogin(
    oauthUser: OAuthUserInput,
    req: Request,
    res: Response,
  ): Promise<void> {
    const email = oauthUser.email?.toLowerCase().trim();
    if (!email) {
      throw new UnauthorizedException('OAuth account has no email');
    }

    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          {
            provider: oauthUser.provider,
            providerId: oauthUser.providerId,
          },
        ],
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name: oauthUser.name,
          avatarUrl: oauthUser.avatarUrl ?? null,
          provider: oauthUser.provider,
          providerId: oauthUser.providerId,
        },
      });
    } else if (!user.providerId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          provider: oauthUser.provider,
          providerId: oauthUser.providerId,
          avatarUrl: oauthUser.avatarUrl ?? user.avatarUrl,
        },
      });
    }

    await this.issueAuthSession(user, res, req);
  }

  async refresh(req: Request, res: Response) {
    const incomingRefreshToken = req.cookies?.['refresh_token'];
    if (!incomingRefreshToken) {
      throw new UnauthorizedException('No refresh token');
    }

    let payload: AuthTokenPayload;
    try {
      payload = this.tokenService.verifyRefreshToken(incomingRefreshToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const storedTokens = await this.prisma.refreshToken.findMany({
      where: {
        userId: payload.sub,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    let matchedToken: (typeof storedTokens)[0] | null = null;
    for (const stored of storedTokens) {
      const match = await this.tokenService.compareToken(
        incomingRefreshToken,
        stored.tokenHash,
      );
      if (match) {
        matchedToken = stored;
        break;
      }
    }

    if (!matchedToken) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: payload.sub },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    await this.prisma.refreshToken.update({
      where: { id: matchedToken.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.issueAuthSession(user, res, req);
    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    });
  }

  async logout(req: Request, res: Response) {
    const incomingRefreshToken = req.cookies?.['refresh_token'];

    if (incomingRefreshToken) {
      try {
        const payload = this.tokenService.verifyRefreshToken(
          incomingRefreshToken,
        );
        await this.prisma.refreshToken.updateMany({
          where: { userId: payload.sub, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      } catch {
        /* token invalid — still clear cookies */
      }
    }

    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });

    return res.json({ message: 'Logged out successfully' });
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        provider: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  private async issueAuthSession(user: User, res: Response, req: Request) {
    const payload: AuthTokenPayload = { sub: user.id, email: user.email };

    const accessToken = this.tokenService.generateAccessToken(payload);
    const refreshToken = this.tokenService.generateRefreshToken(payload);

    const tokenHash = await this.tokenService.hashToken(refreshToken);
    const ttl = this.tokenService.refreshCookieMaxAgeMs();

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        userAgent: req.headers['user-agent'] ?? null,
        ipAddress: req.ip ?? null,
        expiresAt: new Date(Date.now() + ttl),
      },
    });

    res.cookie(
      'access_token',
      accessToken,
      this.tokenService.getCookieOptions('access'),
    );
    res.cookie(
      'refresh_token',
      refreshToken,
      this.tokenService.getCookieOptions('refresh'),
    );
  }
}
