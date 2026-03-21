import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AccessLevel, EnvironmentType } from '@prisma/client';
import { CryptoService } from '../crypto/crypto.service';
import {
  EnvironmentCreatedEvent,
  EnvironmentDeletedEvent,
  EnvironmentUpdatedEvent,
  EventNames,
  SecretsImportedEvent,
} from '../common/events';
import { getSpaceAccess, requireSpaceWriter } from '../common/space-access';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateEnvironmentDto } from './dto/create-environment.dto';
import type { ImportSecretsDto } from './dto/import-secrets.dto';
import type { UpdateEnvironmentDto } from './dto/update-environment.dto';
import { parseRawEnvLines } from './env-file.parser';

@Injectable()
export class EnvironmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Ensures the user may view/act on this environment type for the project.
   * Uses space membership + SpaceVisibilityRule for (spaceId, envType).
   */
  async assertCanAccessEnvironment(
    userId: string,
    projectId: string,
    envType: EnvironmentType,
  ): Promise<void> {
    await this.checkVisibility(userId, projectId, envType);
  }

  async create(projectId: string, userId: string, dto: CreateEnvironmentDto) {
    const project = await this.requireProject(projectId);
    await requireSpaceWriter(this.prisma, project.spaceId, userId);

    const existing = await this.prisma.environment.findUnique({
      where: {
        projectId_name: { projectId, name: dto.name },
      },
    });
    if (existing) {
      throw new ConflictException('An environment with this name already exists');
    }

    const created = await this.prisma.environment.create({
      data: {
        projectId,
        name: dto.name,
        type: dto.type,
        description: dto.description ?? null,
        githubRepo: dto.githubRepo ?? null,
      },
    });

    const actorName = await this.resolveActorName(userId);
    this.eventEmitter.emit(
      EventNames.ENVIRONMENT_CREATED,
      new EnvironmentCreatedEvent(
        project.spaceId,
        projectId,
        project.name,
        created.id,
        created.name,
        created.type,
        userId,
        actorName,
      ),
    );

    return created;
  }

  async update(envId: string, userId: string, dto: UpdateEnvironmentDto) {
    const env = await this.prisma.environment.findUnique({
      where: { id: envId },
      include: { project: true },
    });
    if (!env) {
      throw new NotFoundException('Environment not found');
    }

    await requireSpaceWriter(this.prisma, env.project.spaceId, userId);
    await this.checkVisibility(userId, env.projectId, env.type);

    if (dto.name !== undefined && dto.name !== env.name) {
      const clash = await this.prisma.environment.findUnique({
        where: {
          projectId_name: { projectId: env.projectId, name: dto.name },
        },
      });
      if (clash) {
        throw new ConflictException('An environment with this name already exists');
      }
    }

    const updated = await this.prisma.environment.update({
      where: { id: envId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.githubRepo !== undefined && { githubRepo: dto.githubRepo }),
      },
    });

    const actorName = await this.resolveActorName(userId);
    this.eventEmitter.emit(
      EventNames.ENVIRONMENT_UPDATED,
      new EnvironmentUpdatedEvent(
        env.project.spaceId,
        env.projectId,
        env.project.name,
        updated.id,
        updated.name,
        updated.type,
        userId,
        actorName,
      ),
    );

    return updated;
  }

  async findAll(projectId: string, userId: string) {
    const project = await this.requireProject(projectId);
    await getSpaceAccess(this.prisma, project.spaceId, userId);

    const all = await this.prisma.environment.findMany({
      where: { projectId },
      orderBy: { name: 'asc' },
    });

    const visible: typeof all = [];
    for (const e of all) {
      try {
        await this.checkVisibility(userId, projectId, e.type);
        visible.push(e);
      } catch {
        /* skip */
      }
    }
    return visible;
  }

  async findOne(envId: string, userId: string) {
    const env = await this.prisma.environment.findUnique({
      where: { id: envId },
    });
    if (!env) {
      throw new NotFoundException('Environment not found');
    }

    await this.checkVisibility(userId, env.projectId, env.type);
    return env;
  }

  async delete(envId: string, userId: string) {
    const env = await this.prisma.environment.findUnique({
      where: { id: envId },
      include: {
        project: { include: { space: true } },
      },
    });
    if (!env) {
      throw new NotFoundException('Environment not found');
    }

    await requireSpaceWriter(this.prisma, env.project.spaceId, userId);

    const actorName = await this.resolveActorName(userId);
    await this.eventEmitter.emitAsync(
      EventNames.ENVIRONMENT_DELETED,
      new EnvironmentDeletedEvent(
        env.project.spaceId,
        env.projectId,
        env.project.name,
        envId,
        env.name,
        env.type,
        userId,
        actorName,
      ),
    );

    await this.prisma.environment.delete({ where: { id: envId } });
  }

  async importSecrets(envId: string, userId: string, dto: ImportSecretsDto) {
    const env = await this.prisma.environment.findUnique({
      where: { id: envId },
      include: {
        project: { include: { space: true } },
      },
    });
    if (!env) {
      throw new NotFoundException('Environment not found');
    }

    await requireSpaceWriter(this.prisma, env.project.spaceId, userId);
    await this.checkVisibility(userId, env.projectId, env.type);

    const pairs = parseRawEnvLines(dto.rawEnv);
    if (pairs.length === 0) {
      return { imported: 0 };
    }

    const dekHex = await this.crypto.decryptDek(env.project.space.encDek);

    const encrypted = await Promise.all(
      pairs.map(async ({ key, value }) => {
        const { encryptedValue, iv } = await this.crypto.encryptValue(
          value,
          dekHex,
        );
        return { key, encryptedValue, iv };
      }),
    );

    await this.prisma.$transaction(
      encrypted.map((row) =>
        this.prisma.secret.upsert({
          where: {
            environmentId_key: { environmentId: envId, key: row.key },
          },
          create: {
            environmentId: envId,
            key: row.key,
            encryptedValue: row.encryptedValue,
            iv: row.iv,
          },
          update: {
            encryptedValue: row.encryptedValue,
            iv: row.iv,
          },
        }),
      ),
    );

    const actorName = await this.resolveActorName(userId);
    this.eventEmitter.emit(
      EventNames.SECRETS_IMPORTED,
      new SecretsImportedEvent(
        env.project.spaceId,
        env.projectId,
        env.project.name,
        envId,
        env.name,
        env.type,
        encrypted.length,
        userId,
        actorName,
      ),
    );

    return { imported: encrypted.length };
  }

  private async requireProject(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  private async checkVisibility(
    userId: string,
    projectId: string,
    envType: EnvironmentType,
  ): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { space: true },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const access = await getSpaceAccess(this.prisma, project.spaceId, userId);

    const rule = await this.prisma.spaceVisibilityRule.findUnique({
      where: {
        spaceId_envType: { spaceId: project.spaceId, envType },
      },
    });
    const level = rule?.access ?? AccessLevel.ALL;

    if (level === AccessLevel.ALL) {
      return;
    }

    if (level === AccessLevel.OWNER_ONLY) {
      if (userId !== project.space.ownerId) {
        throw new ForbiddenException('You do not have access to this environment');
      }
      return;
    }

    if (level === AccessLevel.WRITERS) {
      if (!access.canWrite) {
        throw new ForbiddenException('You do not have access to this environment');
      }
    }
  }

  private async resolveActorName(userId: string): Promise<string> {
    const u = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    return u?.name?.trim() || u?.email || 'Someone';
  }
}
