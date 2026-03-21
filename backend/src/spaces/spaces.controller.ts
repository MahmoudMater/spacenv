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
import {
  InviteEmailSentResponseDto,
  SpaceDetailResponseDto,
  SpaceResponseDto,
  SpaceVisibilityRuleResponseDto,
} from '../common/dto/space-response.dto';
import { SpacesService } from './spaces.service';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { UpdateVisibilityDto } from './dto/update-visibility.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateSpaceMemberRoleDto } from './dto/update-space-member-role.dto';

@ApiTags('spaces')
@ApiCookieAuth('access_token')
@Controller('spaces')
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Get()
  @ApiOperation({
    summary: 'List spaces for the current user',
    description:
      'Returns spaces you own and spaces you are a member of (non-owner), merged and sorted by updatedAt. Each item includes viewerMembership (OWNER | MEMBER) and aggregate counts.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of spaces',
    type: SpaceResponseDto,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@CurrentUser() user: User) {
    return this.spacesService.findAllForUser(user.id);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Create a new space',
    description:
      'Creates a team space. You become owner; a DEK is generated and encrypted; default visibility rules are applied.',
  })
  @ApiBody({ type: CreateSpaceDto })
  @ApiResponse({
    status: 201,
    description: 'Space created with members and visibility rules',
    type: SpaceDetailResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@CurrentUser() user: User, @Body() dto: CreateSpaceDto) {
    return this.spacesService.create(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a space by ID' })
  @ApiParam({ name: 'id', description: 'Space CUID', example: 'clx1234abcd' })
  @ApiResponse({
    status: 200,
    description: 'Space with members and visibility rules (no encDek)',
    type: SpaceDetailResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Not a member of this space',
  })
  @ApiResponse({ status: 404, description: 'Space not found' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.spacesService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a space (owner only)' })
  @ApiParam({ name: 'id', description: 'Space CUID' })
  @ApiBody({ type: UpdateSpaceDto })
  @ApiResponse({
    status: 200,
    description: 'Updated space (no encDek)',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string', nullable: true },
        ownerId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Only the owner can update' })
  @ApiResponse({ status: 404, description: 'Space not found' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateSpaceDto,
  ) {
    return this.spacesService.update(id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete a space (owner only)',
    description: 'Cascades to members, projects, environments, and secrets.',
  })
  @ApiParam({ name: 'id', description: 'Space CUID' })
  @ApiResponse({ status: 204, description: 'Space deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Only the owner can delete' })
  @ApiResponse({ status: 404, description: 'Space not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.spacesService.delete(id, user.id);
  }

  @Patch(':id/visibility')
  @ApiOperation({
    summary: 'Upsert visibility rules (owner only)',
    description: 'One rule per environment type; merged via upsert.',
  })
  @ApiParam({ name: 'id', description: 'Space CUID' })
  @ApiBody({ type: UpdateVisibilityDto })
  @ApiResponse({
    status: 200,
    description: 'Current visibility rules for the space',
    type: SpaceVisibilityRuleResponseDto,
    isArray: true,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Only the owner can change rules' })
  @ApiResponse({ status: 404, description: 'Space not found' })
  updateVisibility(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateVisibilityDto,
  ) {
    return this.spacesService.updateVisibilityRules(id, user.id, dto);
  }

  @Post(':id/invite')
  @ApiOperation({
    summary: 'Invite a user by email',
    description:
      'Creates an in-app notification for the invitee with the token in metadata. User must already exist. Membership is created when they POST /invites/accept.',
  })
  @ApiParam({ name: 'id', description: 'Space CUID' })
  @ApiBody({ type: InviteMemberDto })
  @ApiResponse({
    status: 200,
    description: 'Invite email queued/sent',
    type: InviteEmailSentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Only the owner can invite' })
  @ApiResponse({ status: 404, description: 'No user with that email' })
  @ApiResponse({
    status: 409,
    description: 'User is already a member',
  })
  invite(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: InviteMemberDto,
  ) {
    return this.spacesService.inviteMember(id, user.id, dto);
  }

  @Patch(':id/members/:userId')
  @ApiOperation({
    summary: 'Update a member role (owner only)',
    description:
      'Sets VIEWER or WRITER. Cannot change or remove the space owner via this route.',
  })
  @ApiParam({ name: 'id', description: 'Space CUID' })
  @ApiParam({ name: 'userId', description: 'Target user CUID' })
  @ApiBody({ type: UpdateSpaceMemberRoleDto })
  @ApiResponse({ status: 200, description: 'Updated membership' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Owner only or cannot change owner' })
  @ApiResponse({ status: 404, description: 'Space or member not found' })
  updateMemberRole(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateSpaceMemberRoleDto,
  ) {
    return this.spacesService.updateMemberRole(
      id,
      user.id,
      targetUserId,
      dto.role,
    );
  }

  @Delete(':id/members/:userId')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Remove a member from the space (owner only)',
    description: 'Cannot remove yourself or the space owner.',
  })
  @ApiParam({ name: 'id', description: 'Space CUID' })
  @ApiParam({ name: 'userId', description: 'Target user CUID to remove' })
  @ApiResponse({ status: 204, description: 'Member removed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Owner only, or cannot remove self' })
  @ApiResponse({ status: 404, description: 'Space or member not found' })
  async removeMember(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @CurrentUser() user: User,
  ) {
    await this.spacesService.removeMember(id, user.id, targetUserId);
  }
}
