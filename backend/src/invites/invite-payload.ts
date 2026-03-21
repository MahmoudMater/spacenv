import type { SpaceRole } from '@prisma/client';

export type SpaceInviteJwtPayload = {
  spaceId: string;
  email: string;
  invitedById: string;
  /** Omitted on legacy tokens; treated as WRITER when accepting. */
  role?: SpaceRole;
};
