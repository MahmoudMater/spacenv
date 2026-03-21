import { ApiProperty } from '@nestjs/swagger';
import { SpaceRole } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateSpaceMemberRoleDto {
  @ApiProperty({ enum: SpaceRole, example: SpaceRole.WRITER })
  @IsEnum(SpaceRole)
  role: SpaceRole;
}
