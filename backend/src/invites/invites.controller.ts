import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { SpaceDetailResponseDto } from '../common/dto/space-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { InvitesService } from './invites.service';

@ApiTags('invites')
@ApiCookieAuth('access_token')
@Controller('invites')
export class InvitesController {
  constructor(private readonly invites: InvitesService) {}

  @Post('accept')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Accept a space invite',
    description:
      'Verifies signed invite JWT; authenticated user email must match payload; creates SpaceMember.',
  })
  @ApiBody({ type: AcceptInviteDto })
  @ApiResponse({
    status: 201,
    description: 'Membership created; returns space without encDek',
    type: SpaceDetailResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired token',
  })
  @ApiResponse({
    status: 403,
    description: 'Invite email does not match your account',
  })
  @ApiResponse({ status: 404, description: 'Space no longer exists' })
  @ApiResponse({
    status: 409,
    description: 'Already a member',
  })
  accept(
    @CurrentUser() user: User,
    @Body() dto: AcceptInviteDto,
  ) {
    return this.invites.acceptInvite(dto.token, user);
  }
}
