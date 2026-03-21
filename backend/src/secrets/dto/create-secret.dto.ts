import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSecretDto {
  @ApiProperty({
    description: 'The environment variable key',
    example: 'DATABASE_URL',
    minLength: 1,
    maxLength: 256,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  key: string;

  @ApiProperty({
    description:
      'The plaintext value — encrypted with the space DEK before storage',
    example: 'postgres://user:pass@host:5432/db',
    maxLength: 50_000,
  })
  @IsString()
  @MaxLength(50_000)
  value: string;
}
