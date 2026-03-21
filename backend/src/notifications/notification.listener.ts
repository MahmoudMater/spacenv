import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationType, Prisma } from '@prisma/client';
import {
  EnvironmentCreatedEvent,
  EnvironmentDeletedEvent,
  EnvironmentUpdatedEvent,
  EventNames,
  MemberInvitedEvent,
  ProjectCreatedEvent,
  ProjectDeletedEvent,
  ProjectUpdatedEvent,
  SecretAddedEvent,
  SecretDeletedEvent,
  SecretsImportedEvent,
  SecretUpdatedEvent,
} from '../common/events';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationListener {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  @OnEvent(EventNames.MEMBER_INVITED)
  async handleMemberInvited(event: MemberInvitedEvent) {
    const base = this.frontendBaseUrl();
    const url = `${base}/invite/${encodeURIComponent(event.inviteToken)}`;
    const message = `${event.inviterName} invites you to join the space “${event.spaceName}”.`;

    await this.prisma.notification.create({
      data: {
        userId: event.inviteeUserId,
        spaceId: event.spaceId,
        type: NotificationType.SPACE_INVITE,
        actorName: event.inviterName,
        read: false,
        metadata: {
          message,
          url,
          token: event.inviteToken,
          role: event.role,
          spaceName: event.spaceName,
        } satisfies Prisma.JsonObject,
      },
    });
  }

  @OnEvent(EventNames.PROJECT_CREATED)
  async handleProjectCreated(event: ProjectCreatedEvent) {
    const message = `${event.actorName} created the project “${event.projectName}”.`;
    await this.notifySpaceUsers(event.spaceId, event.actorId, {
      type: NotificationType.PROJECT_CREATED,
      projectId: event.projectId,
      secretKey: event.projectName,
      actorName: event.actorName,
      message,
      url: this.projectUrl(event.projectId),
    });
  }

  @OnEvent(EventNames.PROJECT_UPDATED)
  async handleProjectUpdated(event: ProjectUpdatedEvent) {
    const message = `${event.actorName} updated the project “${event.projectName}”.`;
    await this.notifySpaceUsers(event.spaceId, event.actorId, {
      type: NotificationType.PROJECT_UPDATED,
      projectId: event.projectId,
      secretKey: event.projectName,
      actorName: event.actorName,
      message,
      url: this.projectUrl(event.projectId),
    });
  }

  @OnEvent(EventNames.PROJECT_DELETED)
  async handleProjectDeleted(event: ProjectDeletedEvent) {
    const message = `${event.actorName} deleted the project “${event.projectName}”.`;
    await this.notifySpaceUsers(event.spaceId, event.actorId, {
      type: NotificationType.PROJECT_DELETED,
      projectId: event.projectId,
      secretKey: event.projectName,
      actorName: event.actorName,
      message,
      url: this.projectUrl(event.projectId),
    });
  }

  @OnEvent(EventNames.ENVIRONMENT_CREATED)
  async handleEnvironmentCreated(event: EnvironmentCreatedEvent) {
    const message = `${event.actorName} created the environment “${event.environmentName}” in “${event.projectName}”.`;
    await this.notifySpaceUsers(event.spaceId, event.actorId, {
      type: NotificationType.ENVIRONMENT_CREATED,
      projectId: event.projectId,
      environmentId: event.environmentId,
      secretKey: event.environmentName,
      actorName: event.actorName,
      message,
      url: this.projectUrl(event.projectId),
    });
  }

  @OnEvent(EventNames.ENVIRONMENT_UPDATED)
  async handleEnvironmentUpdated(event: EnvironmentUpdatedEvent) {
    const message = `${event.actorName} updated the environment “${event.environmentName}” in “${event.projectName}”.`;
    await this.notifySpaceUsers(event.spaceId, event.actorId, {
      type: NotificationType.ENVIRONMENT_UPDATED,
      projectId: event.projectId,
      environmentId: event.environmentId,
      secretKey: event.environmentName,
      actorName: event.actorName,
      message,
      url: this.projectUrl(event.projectId),
    });
  }

  @OnEvent(EventNames.ENVIRONMENT_DELETED)
  async handleEnvironmentDeleted(event: EnvironmentDeletedEvent) {
    const message = `${event.actorName} deleted the environment “${event.environmentName}” from “${event.projectName}”.`;
    await this.notifySpaceUsers(event.spaceId, event.actorId, {
      type: NotificationType.ENVIRONMENT_DELETED,
      projectId: event.projectId,
      environmentId: event.environmentId,
      secretKey: event.environmentName,
      actorName: event.actorName,
      message,
      url: this.projectUrl(event.projectId),
    });
  }

  @OnEvent(EventNames.SECRETS_IMPORTED)
  async handleSecretsImported(event: SecretsImportedEvent) {
    const n = event.count;
    const secretWord = n === 1 ? 'secret' : 'secrets';
    const message = `${event.actorName} imported ${n} ${secretWord} into “${event.environmentName}” in “${event.projectName}”.`;
    await this.notifySpaceUsers(event.spaceId, event.actorId, {
      type: NotificationType.SECRETS_IMPORTED,
      projectId: event.projectId,
      environmentId: event.environmentId,
      secretKey: String(event.count),
      actorName: event.actorName,
      message,
      url: this.projectUrl(event.projectId),
    });
  }

  @OnEvent(EventNames.SECRET_ADDED)
  async handleSecretAdded(event: SecretAddedEvent) {
    const message = `${event.actorName} added secret “${event.secretKey}” in “${event.environmentName}” (“${event.projectName}”).`;
    await this.notifySpaceUsers(event.spaceId, event.actorId, {
      type: NotificationType.SECRET_ADDED,
      projectId: event.projectId,
      environmentId: event.environmentId,
      secretKey: event.secretKey,
      actorName: event.actorName,
      message,
      url: this.projectUrl(event.projectId),
    });
  }

  @OnEvent(EventNames.SECRET_UPDATED)
  async handleSecretUpdated(event: SecretUpdatedEvent) {
    const message = `${event.actorName} updated secret “${event.secretKey}” in “${event.environmentName}” (“${event.projectName}”).`;
    await this.notifySpaceUsers(event.spaceId, event.actorId, {
      type: NotificationType.SECRET_UPDATED,
      projectId: event.projectId,
      environmentId: event.environmentId,
      secretKey: event.secretKey,
      actorName: event.actorName,
      message,
      url: this.projectUrl(event.projectId),
    });
  }

  @OnEvent(EventNames.SECRET_DELETED)
  async handleSecretDeleted(event: SecretDeletedEvent) {
    const message = `${event.actorName} deleted secret “${event.secretKey}” from “${event.environmentName}” (“${event.projectName}”).`;
    await this.notifySpaceUsers(event.spaceId, event.actorId, {
      type: NotificationType.SECRET_DELETED,
      projectId: event.projectId,
      environmentId: event.environmentId,
      secretKey: event.secretKey,
      actorName: event.actorName,
      message,
      url: this.projectUrl(event.projectId),
    });
  }

  private frontendBaseUrl(): string {
    return (this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000').replace(
      /\/$/,
      '',
    );
  }

  /** Matches Next.js app route `(app)/projects/[projectId]`. */
  private projectUrl(projectId: string): string {
    return `${this.frontendBaseUrl()}/projects/${encodeURIComponent(projectId)}`;
  }

  private async spaceRecipientUserIds(spaceId: string): Promise<string[]> {
    const space = await this.prisma.space.findUnique({
      where: { id: spaceId },
      select: {
        ownerId: true,
        members: { select: { userId: true } },
      },
    });
    if (!space) {
      return [];
    }
    return [...new Set([space.ownerId, ...space.members.map((m) => m.userId)])];
  }

  private async notifySpaceUsers(
    spaceId: string,
    actorId: string,
    row: {
      type: NotificationType;
      projectId?: string;
      environmentId?: string;
      secretKey?: string;
      actorName: string;
      message: string;
      url?: string;
    },
  ) {
    const recipients = await this.spaceRecipientUserIds(spaceId);
    const userIds = recipients.filter((id) => id !== actorId);
    if (userIds.length === 0) {
      return;
    }

    const metadata: Prisma.JsonObject = {
      message: row.message,
      ...(row.url ? { url: row.url } : {}),
    };

    await this.prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        spaceId,
        projectId: row.projectId ?? null,
        environmentId: row.environmentId ?? null,
        secretKey: row.secretKey ?? null,
        type: row.type,
        actorName: row.actorName,
        read: false,
        metadata,
      })),
    });
  }
}
