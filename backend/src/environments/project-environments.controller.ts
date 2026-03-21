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
import { EnvironmentResponseDto } from '../common/dto/environment-response.dto';
import { EnvironmentsService } from './environments.service';
import { CreateEnvironmentDto } from './dto/create-environment.dto';

@ApiTags('environments')
@ApiCookieAuth('access_token')
@Controller('projects/:projectId')
export class ProjectEnvironmentsController {
  constructor(private readonly environmentsService: EnvironmentsService) {}

  @Get('environments')
  @ApiOperation({
    summary: 'List environments in a project',
    description:
      'Returns only environments you are allowed to see per space visibility rules.',
  })
  @ApiParam({ name: 'projectId', description: 'Project CUID' })
  @ApiResponse({
    status: 200,
    type: EnvironmentResponseDto,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Not a project member or blocked by visibility',
  })
  findAll(
    @Param('projectId') projectId: string,
    @CurrentUser() user: User,
  ) {
    return this.environmentsService.findAll(projectId, user.id);
  }

  @Post('environments')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Create an environment (space WRITER or owner)',
    description:
      'Name must be unique within the project. Notifies other space members.',
  })
  @ApiParam({ name: 'projectId', description: 'Project CUID' })
  @ApiBody({ type: CreateEnvironmentDto })
  @ApiResponse({
    status: 201,
    type: EnvironmentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Writers only' })
  @ApiResponse({
    status: 409,
    description: 'Environment name already exists',
  })
  create(
    @Param('projectId') projectId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateEnvironmentDto,
  ) {
    return this.environmentsService.create(projectId, user.id, dto);
  }
}
