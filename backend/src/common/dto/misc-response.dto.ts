import { ApiProperty } from '@nestjs/swagger';

export class ImportSecretsResultDto {
  @ApiProperty({
    description: 'Number of key/value pairs imported or upserted',
    example: 14,
  })
  imported: number;
}

export class MarkReadResultDto {
  @ApiProperty({ description: 'Rows updated', example: 3 })
  updated: number;
}
