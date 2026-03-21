import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  EventNames,
  ProjectCreatedEvent,
  ProjectDeletedEvent,
  ProjectUpdatedEvent,
} from '../common/events';
import { getSpaceAccess, requireSpaceWriter } from '../common/space-access';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateProjectDto } from './dto/create-project.dto';
import type { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(spaceId: string, userId: string, dto: CreateProjectDto) {
    await requireSpaceWriter(this.prisma, spaceId, userId);

    const project = await this.prisma.project.create({
      data: {
        spaceId,
        name: dto.name,
        description: dto.description ?? null,
        createdById: userId,
      },
    });

    const actorName = await this.resolveActorName(userId);
    this.eventEmitter.emit(
      EventNames.PROJECT_CREATED,
      new ProjectCreatedEvent(
        spaceId,
        project.id,
        project.name,
        userId,
        actorName,
      ),
    );

    return project;
  }

  async findAllInSpace(spaceId: string, userId: string) {
    await getSpaceAccess(this.prisma, spaceId, userId);

    return this.prisma.project.findMany({
      where: { spaceId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await getSpaceAccess(this.prisma, project.spaceId, userId);
    return project;
  }

  async update(projectId: string, userId: string, dto: UpdateProjectDto) {
    const project = await this.requireProject(projectId);
    await requireSpaceWriter(this.prisma, project.spaceId, userId);

    const updated = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });

    const actorName = await this.resolveActorName(userId);
    this.eventEmitter.emit(
      EventNames.PROJECT_UPDATED,
      new ProjectUpdatedEvent(
        project.spaceId,
        updated.id,
        updated.name,
        userId,
        actorName,
      ),
    );

    return updated;
  }

  async delete(projectId: string, userId: string) {
    const project = await this.requireProject(projectId);
    await requireSpaceWriter(this.prisma, project.spaceId, userId);

    const actorName = await this.resolveActorName(userId);
    this.eventEmitter.emit(
      EventNames.PROJECT_DELETED,
      new ProjectDeletedEvent(
        project.spaceId,
        project.id,
        project.name,
        userId,
        actorName,
      ),
    );

    await this.prisma.project.delete({ where: { id: projectId } });
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

  private async resolveActorName(userId: string): Promise<string> {
    const u = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    return u?.name?.trim() || u?.email || 'Someone';
  }
}
