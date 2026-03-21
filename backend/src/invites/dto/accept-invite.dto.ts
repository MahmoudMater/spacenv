import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class AcceptInviteDto {
  @ApiProperty({
    description:
      'Signed JWT from the invite email (7-day expiry). Payload email must match your logged-in account.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    minLength: 10,
  })
  @IsString()
  @MinLength(10)
  token: string;
}
