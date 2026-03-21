import { ApiProperty } from '@nestjs/swagger';

/**
 * Secret metadata returned by list endpoints — never includes ciphertext or plaintext value.
 */
export class SecretResponseDto {
  @ApiProperty({ description: 'Secret CUID', example: 'clxsec1234' })
  id: string;

  @ApiProperty({ description: 'Environment CUID', example: 'clxenv1234' })
  environmentId: string;

  @ApiProperty({ description: 'Variable name', example: 'DATABASE_URL' })
  key: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-02T00:00:00.000Z' })
  updatedAt: Date;
}

/** Minimal id+key shape from GET .../secrets (no timestamps in current API). */
export class SecretKeyOnlyResponseDto {
  @ApiProperty({ example: 'clxsec1234' })
  id: string;

  @ApiProperty({ example: 'DATABASE_URL' })
  key: string;
}

/**
 * Plaintext value — only returned by POST /secrets/:id/reveal, never persisted in list responses.
 */
export class SecretRevealResponseDto {
  @ApiProperty({
    description:
      'Plaintext value — only returned by the reveal endpoint, never stored or listed elsewhere.',
    example: 'postgres://user:pass@host:5432/db',
  })
  value: string;
}
