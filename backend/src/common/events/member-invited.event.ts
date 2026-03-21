import type { SpaceRole } from '@prisma/client';

export class MemberInvitedEvent {
  constructor(
    public readonly inviteeUserId: string,
    public readonly inviteeEmail: string,
    public readonly inviteeName: string,
    public readonly inviterName: string,
    public readonly spaceName: string,
    public readonly spaceId: string,
    public readonly inviteToken: string,
    public readonly role: SpaceRole,
  ) {}
}
