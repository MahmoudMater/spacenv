import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SpaceRole, type User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { SpaceInviteJwtPayload } from './invite-payload';

function omitEncDek<T extends { encDek: string }>(
  space: T,
): Omit<T, 'encDek'> {
  const { encDek: _e, ...rest } = space;
  return rest;
}

@Injectable()
export class InvitesService {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async acceptInvite(token: string, user: User) {
    let payload: SpaceInviteJwtPayload;
    try {
      const inviteSecret =
        this.config.get<string>('JWT_INVITE_SECRET') ??
        this.config.get<string>('JWT_ACCESS_SECRET') ??
        'dev-access-secret-change-me';
      payload = this.jwt.verify<SpaceInviteJwtPayload>(token, {
        secret: inviteSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired invite token');
    }

    if (
      user.email.toLowerCase().trim() !==
      payload.email.toLowerCase().trim()
    ) {
      throw new ForbiddenException(
        'This invite was sent to a different email address',
      );
    }

    const space = await this.prisma.space.findUnique({
      where: { id: payload.spaceId },
    });
    if (!space) {
      throw new NotFoundException('Space no longer exists');
    }

    const existing = await this.prisma.spaceMember.findUnique({
      where: {
        spaceId_userId: { spaceId: payload.spaceId, userId: user.id },
      },
    });
    if (existing) {
      throw new ConflictException('You are already a member of this space');
    }

    const role = payload.role ?? SpaceRole.WRITER;

    await this.prisma.spaceMember.create({
      data: {
        spaceId: payload.spaceId,
        userId: user.id,
        invitedById: payload.invitedById,
        role,
      },
    });

    const full = await this.prisma.space.findUniqueOrThrow({
      where: { id: payload.spaceId },
      include: {
        visibilityRules: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return omitEncDek(full);
  }
}
