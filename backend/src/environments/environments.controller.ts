import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { EnvironmentResponseDto } from '../common/dto/environment-response.dto';
import { ImportSecretsResultDto } from '../common/dto/misc-response.dto';
import { EnvironmentsService } from './environments.service';
import { ImportSecretsDto } from './dto/import-secrets.dto';
import { UpdateEnvironmentDto } from './dto/update-environment.dto';

@ApiTags('environments')
@ApiCookieAuth('access_token')
@Controller('environments')
export class EnvironmentsController {
  constructor(private readonly environmentsService: EnvironmentsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get an environment by ID' })
  @ApiParam({ name: 'id', description: 'Environment CUID' })
  @ApiResponse({ status: 200, type: EnvironmentResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Blocked by visibility rules',
  })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.environmentsService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an environment (space WRITER or owner)',
    description: 'Notifies other space members (ENVIRONMENT_UPDATED).',
  })
  @ApiParam({ name: 'id', description: 'Environment CUID' })
  @ApiBody({ type: UpdateEnvironmentDto })
  @ApiResponse({ status: 200, type: EnvironmentResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Writers only or visibility' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 409, description: 'Duplicate environment name' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateEnvironmentDto,
  ) {
    return this.environmentsService.update(id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete an environment (WRITER only)',
    description: 'Notifies other project members (ENVIRONMENT_DELETED).',
  })
  @ApiParam({ name: 'id', description: 'Environment CUID' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Writers only or visibility' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.environmentsService.delete(id, user.id);
  }

  @Post(':id/import')
  @ApiOperation({
    summary: 'Bulk import secrets from .env text (WRITER only)',
    description:
      'Parses KEY=VALUE lines, encrypts with the space DEK, upserts secrets; notifies other space members (SECRETS_IMPORTED).',
  })
  @ApiParam({ name: 'id', description: 'Environment CUID' })
  @ApiBody({ type: ImportSecretsDto })
  @ApiResponse({
    status: 200,
    description: 'Import result',
    type: ImportSecretsResultDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid body or signature' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Writers only or visibility' })
  @ApiResponse({ status: 404, description: 'Environment not found' })
  importSecrets(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: ImportSecretsDto,
  ) {
    return this.environmentsService.importSecrets(id, user.id, dto);
  }
}
