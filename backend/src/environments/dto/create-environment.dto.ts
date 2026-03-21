import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { EnvironmentType } from '@prisma/client';

export class CreateEnvironmentDto {
  @ApiProperty({
    description: 'Human-readable name for the environment',
    example: '.env.production',
    minLength: 1,
    maxLength: 120,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name: string;

  @ApiProperty({
    description:
      'Environment type — controls badge color and default visibility rules',
    enum: EnvironmentType,
    example: EnvironmentType.PRODUCTION,
  })
  @IsEnum(EnvironmentType)
  type: EnvironmentType;

  @ApiPropertyOptional({
    description: 'Optional notes shown in the UI',
    example: 'Live keys — rotate monthly',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description:
      'GitHub repository URL for reference only (not connected automatically)',
    example: 'https://github.com/linkiasoft/edva-project',
  })
  @IsOptional()
  @ValidateIf((_, v) => v != null && v !== '')
  @IsUrl({ require_tld: false })
  githubRepo?: string;
}
