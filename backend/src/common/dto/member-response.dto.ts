import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SpaceRole } from '@prisma/client';

export class MemberResponseDto {
  @ApiProperty({ example: 'clxmember123' })
  id: string;

  @ApiProperty({ example: 'clxuser456' })
  userId: string;

  @ApiProperty({
    description: 'Space membership role',
    enum: SpaceRole,
    example: SpaceRole.WRITER,
  })
  role: SpaceRole;

  @ApiProperty({ example: 'ahmed@linkiasoft.com' })
  email: string;

  @ApiPropertyOptional({ example: 'Ahmed Matter' })
  name?: string | null;

  @ApiPropertyOptional({ example: 'https://avatars.githubusercontent.com/u/1' })
  avatarUrl?: string | null;
}
