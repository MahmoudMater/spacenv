import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProjectResponseDto {
  @ApiProperty({ description: 'Project CUID', example: 'clxproj1234' })
  id: string;

  @ApiProperty({ description: 'Parent space CUID', example: 'clxspace123' })
  spaceId: string;

  @ApiProperty({ description: 'Project name', example: 'API Service' })
  name: string;

  @ApiPropertyOptional({
    description: 'Optional description',
    example: 'Backend monolith',
  })
  description?: string | null;

  @ApiProperty({ description: 'User who created the project', example: 'clxuser1' })
  createdById: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-02T00:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Number of project members (when included)',
    example: 4,
    required: false,
  })
  memberCount?: number;

  @ApiProperty({
    description: 'Number of environments (when included)',
    example: 3,
    required: false,
  })
  environmentCount?: number;
}
