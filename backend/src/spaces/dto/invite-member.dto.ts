import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SpaceRole } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional } from 'class-validator';

export class InviteMemberDto {
  @ApiProperty({
    description: 'Email address of the existing user to invite',
    example: 'ahmed@linkiasoft.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Role after the user accepts the invite',
    enum: SpaceRole,
    default: SpaceRole.WRITER,
  })
  @IsOptional()
  @IsEnum(SpaceRole)
  role?: SpaceRole;
}
