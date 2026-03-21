import { Controller, Get, Param, Patch } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MarkReadResultDto } from '../common/dto/misc-response.dto';
import { NotificationResponseDto } from '../common/dto/notification-response.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiCookieAuth('access_token')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @ApiOperation({
    summary: 'List notifications',
    description: 'Unread first, newest first, max 50.',
  })
  @ApiResponse({
    status: 200,
    type: NotificationResponseDto,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  list(@CurrentUser() user: User) {
    return this.notifications.findAllForUser(user.id);
  }

  @Patch('read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({
    status: 200,
    type: MarkReadResultDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  markAllRead(@CurrentUser() user: User) {
    return this.notifications.markAllRead(user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark one notification as read' })
  @ApiParam({ name: 'id', description: 'Notification CUID' })
  @ApiResponse({
    status: 200,
    type: MarkReadResultDto,
    description: 'updated count may be 0 if id not found or not yours',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  markOneRead(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.notifications.markOneRead(id, user.id);
  }
}
