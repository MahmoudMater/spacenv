import {
  Body,
  Controller,
  Delete,
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
import {
  SecretKeyOnlyResponseDto,
  SecretRevealResponseDto,
} from '../common/dto/secret-response.dto';
import { UpdateSecretDto } from './dto/update-secret.dto';
import { SecretsService } from './secrets.service';

@ApiTags('secrets')
@ApiCookieAuth('access_token')
@Controller('secrets')
export class SecretsController {
  constructor(private readonly secretsService: SecretsService) {}

  @Post(':id/reveal')
  @ApiOperation({
    summary: 'Reveal decrypted secret value',
    description:
      'One-off plaintext response; value is not stored or logged by this endpoint.',
  })
  @ApiParam({ name: 'id', description: 'Secret CUID' })
  @ApiResponse({
    status: 200,
    type: SecretRevealResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Visibility rules block access' })
  @ApiResponse({ status: 404, description: 'Secret not found' })
  reveal(@Param('id') id: string, @CurrentUser() user: User) {
    return this.secretsService.reveal(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update secret value (WRITER + visibility)',
    description: 'Re-encrypts and replaces stored ciphertext.',
  })
  @ApiParam({ name: 'id', description: 'Secret CUID' })
  @ApiBody({ type: UpdateSecretDto })
  @ApiResponse({
    status: 200,
    type: SecretKeyOnlyResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Writers only or visibility' })
  @ApiResponse({ status: 404, description: 'Secret not found' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateSecretDto,
  ) {
    return this.secretsService.update(id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete a secret (WRITER + visibility)',
    description: 'Hard delete; notifies other project members.',
  })
  @ApiParam({ name: 'id', description: 'Secret CUID' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Writers only or visibility' })
  @ApiResponse({ status: 404, description: 'Secret not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.secretsService.delete(id, user.id);
  }
}
