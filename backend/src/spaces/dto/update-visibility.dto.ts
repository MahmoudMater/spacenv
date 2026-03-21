import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, ValidateNested } from 'class-validator';
import { AccessLevel, EnvironmentType } from '@prisma/client';

export class VisibilityRuleItemDto {
  @ApiProperty({
    description: 'Which environment type this rule applies to',
    enum: EnvironmentType,
    example: EnvironmentType.PRODUCTION,
  })
  @IsEnum(EnvironmentType)
  envType: EnvironmentType;

  @ApiProperty({
    description: 'Who can view secrets for this environment type',
    enum: AccessLevel,
    example: AccessLevel.WRITERS,
  })
  @IsEnum(AccessLevel)
  access: AccessLevel;
}

export class UpdateVisibilityDto {
  @ApiProperty({
    description: 'One rule per environment type (upserted by spaceId + envType)',
    type: [VisibilityRuleItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VisibilityRuleItemDto)
  rules: VisibilityRuleItemDto[];
}
