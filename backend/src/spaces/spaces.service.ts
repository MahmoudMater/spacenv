import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessLevel, EnvironmentType, SpaceRole } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { MemberInvitedEvent } from '../common/events';
import { EventNames } from '../common/events/event-names';
import { CryptoService } from '../crypto/crypto.service';
import { PrismaService } from '../prisma/prisma.service';
import type { SpaceInviteJwtPayload } from '../invites/invite-payload';
import type { CreateSpaceDto } from './dto/create-space.dto';
import type { UpdateSpaceDto } from './dto/update-space.dto';
import type { UpdateVisibilityDto } from './dto/update-visibility.dto';
import type { InviteMemberDto } from './dto/invite-member.dto';

const ALL_ENV_TYPES: EnvironmentType[] = [
  EnvironmentType.PRODUCTION,
  EnvironmentType.STAGING,
  EnvironmentType.DEVELOPMENT,
  EnvironmentType.QC,
  EnvironmentType.OTHER,
];

function omitEncDek<T extends { encDek: string }>(
  space: T,
): Omit<T, 'encDek'> {
  const { encDek: _enc, ...rest } = space;
  return rest;
}

@Injectable()
export class SpacesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
    private readonly eventEmitter: EventEmitter2,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async create(userId: string, dto: CreateSpaceDto) {
    const dek = await this.crypto.generateDek();
    const encDek = await this.crypto.encryptDek(dek);

    const defaultRules = ALL_ENV_TYPES.map((envType) => ({
      envType,
      access:
        envType === EnvironmentType.PRODUCTION
          ? AccessLevel.WRITERS
          : AccessLevel.ALL,
    }));

    return this.prisma.$transaction(async (tx) => {
      const space = await tx.space.create({
        data: {
          name: dto.name,
          description: dto.description ?? null,
          encDek,
          ownerId: userId,
        },
      });

      await tx.spaceMember.create({
        data: {
          spaceId: space.id,
          userId,
          role: SpaceRole.WRITER,
        },
      });

      await tx.spaceVisibilityRule.createMany({
        data: defaultRules.map((r) => ({
          spaceId: space.id,
          envType: r.envType,
          access: r.access,
        })),
      });

      const full = await tx.space.findUniqueOrThrow({
        where: { id: space.id },
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
    });
  }

  /**
   * Lists spaces the user owns and spaces they belong to as a non-owner member.
   * Uses two queries so PostgreSQL can use `Space.ownerId` and `SpaceMember.userId`
   * indexes instead of a single OR plan over a nested relation.
   */
  async findAllForUser(userId: string) {
    const includeCounts = {
      include: {
        _count: {
          select: { members: true, projects: true },
        },
      },
      orderBy: { updatedAt: 'desc' as const },
    };

    const [ownedRows, memberRows] = await Promise.all([
      this.prisma.space.findMany({
        where: { ownerId: userId },
        ...includeCounts,
      }),
      this.prisma.space.findMany({
        where: {
          ownerId: { not: userId },
          members: { some: { userId } },
        },
        ...includeCounts,
      }),
    ]);

    const mapRow = (
      row: (typeof ownedRows)[0],
      viewerMembership: 'OWNER' | 'MEMBER',
    ) => {
      const { _count, ...space } = row;
      return {
        ...omitEncDek(space),
        memberCount: _count.members,
        projectCount: _count.projects,
        viewerMembership,
      };
    };

    const owned = ownedRows.map((row) => mapRow(row, 'OWNER'));
    const member = memberRows.map((row) => mapRow(row, 'MEMBER'));

    return [...owned, ...member].sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
    );
  }

  async findOne(spaceId: string, userId: string) {
    const space = await this.prisma.space.findUnique({
      where: { id: spaceId },
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

    if (!space) {
      throw new NotFoundException('Space not found');
    }

    const isMember =
      space.ownerId === userId ||
      space.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this space');
    }

    return omitEncDek(space);
  }

  async update(spaceId: string, userId: string, dto: UpdateSpaceDto) {
    const space = await this.requireSpace(spaceId);
    this.assertOwner(space.ownerId, userId);

    const updated = await this.prisma.space.update({
      where: { id: spaceId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });
    return omitEncDek(updated);
  }

  async delete(spaceId: string, userId: string) {
    const space = await this.requireSpace(spaceId);
    this.assertOwner(space.ownerId, userId);

    await this.prisma.space.delete({ where: { id: spaceId } });
  }

  async updateVisibilityRules(
    spaceId: string,
    userId: string,
    dto: UpdateVisibilityDto,
  ) {
    const space = await this.requireSpace(spaceId);
    this.assertOwner(space.ownerId, userId);

    await this.prisma.$transaction(
      dto.rules.map((rule) =>
        this.prisma.spaceVisibilityRule.upsert({
          where: {
            spaceId_envType: { spaceId, envType: rule.envType },
          },
          create: {
            spaceId,
            envType: rule.envType,
            access: rule.access,
          },
          update: { access: rule.access },
        }),
      ),
    );

    return this.prisma.spaceVisibilityRule.findMany({
      where: { spaceId },
      orderBy: { envType: 'asc' },
    });
  }

  async inviteMember(spaceId: string, userId: string, dto: InviteMemberDto) {
    const space = await this.requireSpace(spaceId);
    this.assertOwner(space.ownerId, userId);

    const invitee = await this.prisma.user.findFirst({
      where: { email: { equals: dto.email, mode: 'insensitive' } },
    });
    if (!invitee) {
      throw new NotFoundException('No user with this email');
    }

    const existing = await this.prisma.spaceMember.findUnique({
      where: {
        spaceId_userId: { spaceId, userId: invitee.id },
      },
    });
    if (existing) {
      throw new ConflictException('User is already a member');
    }

    const inviter = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    const inviteRole = dto.role ?? SpaceRole.WRITER;

    const payload: SpaceInviteJwtPayload = {
      spaceId,
      email: invitee.email,
      invitedById: userId,
      role: inviteRole,
    };
    const inviteSecret =
      this.config.get<string>('JWT_INVITE_SECRET') ??
      this.config.get<string>('JWT_ACCESS_SECRET') ??
      'dev-access-secret-change-me';
    const token = this.jwt.sign(payload, {
      expiresIn: '7d',
      secret: inviteSecret,
    });

    this.eventEmitter.emit(
      EventNames.MEMBER_INVITED,
      new MemberInvitedEvent(
        invitee.id,
        invitee.email,
        invitee.name?.trim() || invitee.email,
        inviter?.name?.trim() || 'Someone',
        space.name,
        space.id,
        token,
        inviteRole,
      ),
    );

    return {
      sent: true,
      email: invitee.email,
    };
  }

  async removeMember(
    spaceId: string,
    ownerId: string,
    targetUserId: string,
  ) {
    const space = await this.requireSpace(spaceId);
    this.assertOwner(space.ownerId, ownerId);

    if (targetUserId === ownerId) {
      throw new ForbiddenException('Cannot remove yourself');
    }

    if (targetUserId === space.ownerId) {
      throw new ForbiddenException('Cannot remove the space owner');
    }

    const membership = await this.prisma.spaceMember.findUnique({
      where: {
        spaceId_userId: { spaceId, userId: targetUserId },
      },
    });
    if (!membership) {
      throw new NotFoundException('Member not found in this space');
    }

    await this.prisma.spaceMember.delete({
      where: {
        spaceId_userId: { spaceId, userId: targetUserId },
      },
    });
  }

  async updateMemberRole(
    spaceId: string,
    ownerId: string,
    targetUserId: string,
    role: SpaceRole,
  ) {
    const space = await this.requireSpace(spaceId);
    this.assertOwner(space.ownerId, ownerId);

    if (targetUserId === space.ownerId) {
      throw new ForbiddenException('Cannot change the space owner role');
    }

    const membership = await this.prisma.spaceMember.findUnique({
      where: {
        spaceId_userId: { spaceId, userId: targetUserId },
      },
    });
    if (!membership) {
      throw new NotFoundException('Member not found in this space');
    }

    return this.prisma.spaceMember.update({
      where: { id: membership.id },
      data: { role },
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
    });
  }

  private async requireSpace(spaceId: string) {
    const space = await this.prisma.space.findUnique({
      where: { id: spaceId },
    });
    if (!space) {
      throw new NotFoundException('Space not found');
    }
    return space;
  }

  private assertOwner(ownerId: string, userId: string) {
    if (ownerId !== userId) {
      throw new ForbiddenException('Only the space owner can perform this action');
    }
  }
}
