import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EnvironmentType } from '@prisma/client';

export class EnvironmentResponseDto {
  @ApiProperty({ example: 'clxenv1234' })
  id: string;

  @ApiProperty({ example: 'clxproj1234' })
  projectId: string;

  @ApiProperty({ example: '.env.production' })
  name: string;

  @ApiProperty({
    description: 'Environment type — affects visibility rules',
    enum: EnvironmentType,
    example: EnvironmentType.PRODUCTION,
  })
  type: EnvironmentType;

  @ApiPropertyOptional({ example: 'Live production keys' })
  description?: string | null;

  @ApiPropertyOptional({
    example: 'https://github.com/linkiasoft/edva-project',
  })
  githubRepo?: string | null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-02T00:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Number of secrets (when included)',
    example: 12,
    required: false,
  })
  secretCount?: number;
}
