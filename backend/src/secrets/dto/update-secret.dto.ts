import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class UpdateSecretDto {
  @ApiProperty({
    description: 'New plaintext value (re-encrypted and stored)',
    example: 'postgres://user:newpass@host:5432/db',
    maxLength: 50_000,
  })
  @IsString()
  @MaxLength(50_000)
  value: string;
}
