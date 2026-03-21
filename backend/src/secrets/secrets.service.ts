import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EnvironmentType, Prisma } from '@prisma/client';
import { CryptoService } from '../crypto/crypto.service';
import {
  SecretAddedEvent,
  SecretDeletedEvent,
  SecretUpdatedEvent,
} from '../common/events';
import { EventNames } from '../common/events/event-names';
import { requireSpaceWriter } from '../common/space-access';
import { EnvironmentsService } from '../environments/environments.service';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateSecretDto } from './dto/create-secret.dto';
import type { UpdateSecretDto } from './dto/update-secret.dto';

@Injectable()
export class SecretsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
    private readonly environments: EnvironmentsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(envId: string, userId: string) {
    const env = await this.prisma.environment.findUnique({
      where: { id: envId },
    });
    if (!env) {
      throw new NotFoundException('Environment not found');
    }

    await this.environments.assertCanAccessEnvironment(
      userId,
      env.projectId,
      env.type,
    );

    return this.prisma.secret.findMany({
      where: { environmentId: envId },
      select: { id: true, key: true },
      orderBy: { key: 'asc' },
    });
  }

  async reveal(secretId: string, userId: string) {
    const secret = await this.loadSecretChain(secretId);
    if (!secret) {
      throw new NotFoundException('Secret not found');
    }

    await this.environments.assertCanAccessEnvironment(
      userId,
      secret.environment.projectId,
      secret.environment.type,
    );

    const dekHex = await this.crypto.decryptDek(
      secret.environment.project.space.encDek,
    );
    const value = await this.crypto.decryptValue(
      secret.encryptedValue,
      secret.iv,
      dekHex,
    );
    return { value };
  }

  async create(envId: string, userId: string, dto: CreateSecretDto) {
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
    await this.environments.assertCanAccessEnvironment(
      userId,
      env.projectId,
      env.type,
    );

    const dekHex = await this.crypto.decryptDek(env.project.space.encDek);
    const { encryptedValue, iv } = await this.crypto.encryptValue(
      dto.value,
      dekHex,
    );

    let created;
    try {
      created = await this.prisma.secret.create({
        data: {
          environmentId: envId,
          key: dto.key,
          encryptedValue,
          iv,
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('A secret with this key already exists');
      }
      throw e;
    }

    const actorName = await this.resolveActorName(userId);
    this.eventEmitter.emit(
      EventNames.SECRET_ADDED,
      new SecretAddedEvent(
        env.project.spaceId,
        env.projectId,
        env.project.name,
        envId,
        env.name,
        env.type,
        dto.key,
        userId,
        actorName,
      ),
    );

    return { id: created.id, key: created.key };
  }

  async update(secretId: string, userId: string, dto: UpdateSecretDto) {
    const secret = await this.loadSecretChain(secretId);
    if (!secret) {
      throw new NotFoundException('Secret not found');
    }

    const { environment: env } = secret;
    await requireSpaceWriter(this.prisma, env.project.spaceId, userId);
    await this.environments.assertCanAccessEnvironment(
      userId,
      env.projectId,
      env.type,
    );

    const dekHex = await this.crypto.decryptDek(env.project.space.encDek);
    const { encryptedValue, iv } = await this.crypto.encryptValue(
      dto.value,
      dekHex,
    );

    await this.prisma.secret.update({
      where: { id: secretId },
      data: { encryptedValue, iv },
    });

    const actorName = await this.resolveActorName(userId);
    this.eventEmitter.emit(
      EventNames.SECRET_UPDATED,
      new SecretUpdatedEvent(
        env.project.spaceId,
        env.projectId,
        env.project.name,
        env.id,
        env.name,
        env.type,
        secret.key,
        userId,
        actorName,
      ),
    );

    return { id: secretId, key: secret.key };
  }

  async delete(secretId: string, userId: string) {
    const secret = await this.loadSecretChain(secretId);
    if (!secret) {
      throw new NotFoundException('Secret not found');
    }

    const { environment: env } = secret;
    await requireSpaceWriter(this.prisma, env.project.spaceId, userId);
    await this.environments.assertCanAccessEnvironment(
      userId,
      env.projectId,
      env.type,
    );

    await this.prisma.secret.delete({ where: { id: secretId } });

    const actorName = await this.resolveActorName(userId);
    this.eventEmitter.emit(
      EventNames.SECRET_DELETED,
      new SecretDeletedEvent(
        env.project.spaceId,
        env.projectId,
        env.project.name,
        env.id,
        env.name,
        env.type,
        secret.key,
        userId,
        actorName,
      ),
    );
  }

  async downloadEnv(
    envId: string,
    userId: string,
  ): Promise<{ content: string; envType: EnvironmentType }> {
    const env = await this.prisma.environment.findUnique({
      where: { id: envId },
      include: {
        project: { include: { space: true } },
        secrets: true,
      },
    });
    if (!env) {
      throw new NotFoundException('Environment not found');
    }

    await this.environments.assertCanAccessEnvironment(
      userId,
      env.projectId,
      env.type,
    );

    const dekHex = await this.crypto.decryptDek(env.project.space.encDek);
    const lines: string[] = [];

    const sorted = [...env.secrets].sort((a, b) => a.key.localeCompare(b.key));
    for (const s of sorted) {
      const value = await this.crypto.decryptValue(
        s.encryptedValue,
        s.iv,
        dekHex,
      );
      lines.push(`${s.key}=${value}`);
    }

    return {
      content: lines.join('\n') + (lines.length ? '\n' : ''),
      envType: env.type,
    };
  }

  private async loadSecretChain(secretId: string) {
    return this.prisma.secret.findUnique({
      where: { id: secretId },
      include: {
        environment: {
          include: {
            project: { include: { space: true } },
          },
        },
      },
    });
  }

  private async resolveActorName(userId: string): Promise<string> {
    const u = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    return u?.name?.trim() || u?.email || 'Someone';
  }
}
