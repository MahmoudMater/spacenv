import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { PrismaClient } from '@prisma/client';
import { SpaceRole } from '@prisma/client';

export type SpaceAccess = {
  spaceId: string;
  ownerId: string;
  canWrite: boolean;
};

export async function getSpaceAccess(
  prisma: PrismaClient,
  spaceId: string,
  userId: string,
): Promise<SpaceAccess> {
  const space = await prisma.space.findUnique({
    where: { id: spaceId },
    select: { id: true, ownerId: true },
  });
  if (!space) {
    throw new NotFoundException('Space not found');
  }
  if (space.ownerId === userId) {
    return { spaceId: space.id, ownerId: space.ownerId, canWrite: true };
  }
  const m = await prisma.spaceMember.findUnique({
    where: { spaceId_userId: { spaceId, userId } },
  });
  if (!m) {
    throw new ForbiddenException('You are not a member of this space');
  }
  return {
    spaceId: space.id,
    ownerId: space.ownerId,
    canWrite: m.role === SpaceRole.WRITER,
  };
}

export async function requireSpaceWriter(
  prisma: PrismaClient,
  spaceId: string,
  userId: string,
): Promise<SpaceAccess> {
  const access = await getSpaceAccess(prisma, spaceId, userId);
  if (!access.canWrite) {
    throw new ForbiddenException('Writers or owner only');
  }
  return access;
}
