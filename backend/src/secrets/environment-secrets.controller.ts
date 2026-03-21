import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { User } from '@prisma/client';
import type { Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SecretKeyOnlyResponseDto } from '../common/dto/secret-response.dto';
import { CreateSecretDto } from './dto/create-secret.dto';
import { SecretsService } from './secrets.service';

@ApiTags('secrets')
@ApiCookieAuth('access_token')
@Controller('environments/:envId')
export class EnvironmentSecretsController {
  constructor(private readonly secretsService: SecretsService) {}

  @Get('secrets')
  @ApiOperation({
    summary: 'List secret keys (no values)',
    description:
      'Returns only id and key per secret; ciphertext is never exposed.',
  })
  @ApiParam({ name: 'envId', description: 'Environment CUID' })
  @ApiResponse({
    status: 200,
    type: SecretKeyOnlyResponseDto,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Visibility rules block access' })
  @ApiResponse({ status: 404, description: 'Environment not found' })
  findAll(@Param('envId') envId: string, @CurrentUser() user: User) {
    return this.secretsService.findAll(envId, user.id);
  }

  @Post('secrets')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Create a secret (WRITER + visibility)',
    description: 'Value is encrypted before persistence; members are notified.',
  })
  @ApiParam({ name: 'envId', description: 'Environment CUID' })
  @ApiBody({ type: CreateSecretDto })
  @ApiResponse({
    status: 201,
    description: 'Created id and key only',
    type: SecretKeyOnlyResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Writers only or visibility' })
  @ApiResponse({ status: 404, description: 'Environment not found' })
  @ApiResponse({ status: 409, description: 'Duplicate key in environment' })
  create(
    @Param('envId') envId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateSecretDto,
  ) {
    return this.secretsService.create(envId, user.id, dto);
  }

  @Get('download')
  @ApiOperation({
    summary: 'Download decrypted .env file',
    description:
      'Plaintext KEY=VALUE lines, one per secret, sorted by key. Requires visibility access.',
  })
  @ApiProduces('text/plain')
  @ApiParam({ name: 'envId', description: 'Environment CUID' })
  @ApiResponse({
    status: 200,
    description: 'Raw .env text attachment',
    content: {
      'text/plain': {
        schema: {
          type: 'string',
          example: 'DATABASE_URL=postgres://...\nAPI_KEY=secret\n',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Visibility rules block access' })
  @ApiResponse({ status: 404, description: 'Environment not found' })
  async download(
    @Param('envId') envId: string,
    @CurrentUser() user: User,
    @Res({ passthrough: false }) res: Response,
  ) {
    const { content, envType } = await this.secretsService.downloadEnv(
      envId,
      user.id,
    );
    const ext = envType.toLowerCase();
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=".env.${ext}"`,
    );
    res.send(content);
  }
}
