import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ProjectResponseDto } from '../common/dto/project-response.dto';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';

@ApiTags('projects')
@ApiCookieAuth('access_token')
@Controller('spaces/:spaceId')
export class SpaceProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get('projects')
  @ApiOperation({
    summary: 'List projects in a space',
    description: 'All projects in the space (requires space membership).',
  })
  @ApiParam({ name: 'spaceId', description: 'Space CUID' })
  @ApiResponse({
    status: 200,
    type: ProjectResponseDto,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Not a member of this space',
  })
  findAllInSpace(
    @Param('spaceId') spaceId: string,
    @CurrentUser() user: User,
  ) {
    return this.projectsService.findAllInSpace(spaceId, user.id);
  }

  @Post('projects')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Create a project in a space',
    description: 'Requires space WRITER role or owner.',
  })
  @ApiParam({ name: 'spaceId', description: 'Space CUID' })
  @ApiBody({ type: CreateProjectDto })
  @ApiResponse({
    status: 201,
    description: 'Project created',
    type: ProjectResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Not a member of this space',
  })
  create(
    @Param('spaceId') spaceId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.create(spaceId, user.id, dto);
  }
}
