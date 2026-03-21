import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccessLevel, EnvironmentType } from '@prisma/client';

export class SpaceVisibilityRuleResponseDto {
  @ApiProperty({ example: 'clxrule123' })
  id: string;

  @ApiProperty({ example: 'clxspace123' })
  spaceId: string;

  @ApiProperty({ enum: EnvironmentType, example: EnvironmentType.PRODUCTION })
  envType: EnvironmentType;

  @ApiProperty({ enum: AccessLevel, example: AccessLevel.WRITERS })
  access: AccessLevel;
}

/** List item: space summary with aggregate counts (no `encDek`). */
export class SpaceResponseDto {
  @ApiProperty({ description: 'Space CUID', example: 'clx1234abcd' })
  id: string;

  @ApiProperty({ description: 'Display name', example: 'Linkiasoft' })
  name: string;

  @ApiPropertyOptional({
    description: 'Short description',
    example: 'Main engineering workspace',
  })
  description?: string | null;

  @ApiProperty({ description: 'Owner user CUID', example: 'clx9999owner' })
  ownerId: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-02T00:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Number of space members',
    example: 3,
  })
  memberCount: number;

  @ApiProperty({
    description: 'Number of projects in the space',
    example: 5,
  })
  projectCount: number;

  @ApiProperty({
    enum: ['OWNER', 'MEMBER'],
    description:
      'OWNER if you own this space; MEMBER if you access it only via membership (invited / joined)',
    example: 'OWNER',
  })
  viewerMembership: 'OWNER' | 'MEMBER';
}

/** Single space with members and visibility rules (no `encDek`). */
export class SpaceDetailResponseDto {
  @ApiProperty({ example: 'clx1234abcd' })
  id: string;

  @ApiProperty({ example: 'Linkiasoft' })
  name: string;

  @ApiPropertyOptional({ example: 'Main engineering workspace' })
  description?: string | null;

  @ApiProperty({ example: 'clx9999owner' })
  ownerId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [SpaceVisibilityRuleResponseDto] })
  visibilityRules: SpaceVisibilityRuleResponseDto[];

  @ApiProperty({
    description: 'Space memberships with user profile',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        spaceId: { type: 'string' },
        userId: { type: 'string' },
        role: { type: 'string', enum: ['VIEWER', 'WRITER'] },
        invitedById: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string', nullable: true },
            avatarUrl: { type: 'string', nullable: true },
          },
        },
      },
    },
  })
  members: unknown[];
}

export class InviteEmailSentResponseDto {
  @ApiProperty({ example: true })
  sent: boolean;

  @ApiProperty({ example: 'ahmed@linkiasoft.com' })
  email: string;
}
