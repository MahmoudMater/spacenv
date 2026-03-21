import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';

export class NotificationResponseDto {
  @ApiProperty({ example: 'clxnotif123' })
  id: string;

  @ApiProperty({ enum: NotificationType, example: NotificationType.SECRET_ADDED })
  type: NotificationType;

  @ApiPropertyOptional({
    description:
      'Context string (secret key, project/env name, import count, etc.)',
    example: 'DATABASE_URL',
  })
  secretKey?: string | null;

  @ApiProperty({ example: 'Jane Doe' })
  actorName: string;

  @ApiPropertyOptional({ example: 'clxproj1234' })
  projectId?: string | null;

  @ApiProperty({ example: 'clxspace123' })
  spaceId: string;

  @ApiPropertyOptional({ example: 'clxenv1234' })
  environmentId?: string | null;

  @ApiPropertyOptional({
    description:
      'JSON with at least `message` (human-readable). `SPACE_INVITE` and project-related types include `url` for navigation. Invite also includes `token`, `role`, `spaceName`.',
    example: {
      message: 'Alex invites you to join the space “Acme”.',
      url: 'http://localhost:3000/invite/eyJhbGciOiJIUzI1NiJ9...',
      token: 'eyJhbGciOiJIUzI1NiJ9...',
      role: 'WRITER',
      spaceName: 'Acme',
    },
  })
  metadata?: unknown;

  @ApiProperty({ example: false })
  read: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;
}
