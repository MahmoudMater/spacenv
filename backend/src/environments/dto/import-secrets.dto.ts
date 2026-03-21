import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ImportSecretsDto {
  @ApiProperty({
    description:
      'Raw .env file content pasted by the user. Comments and blank lines are ignored; only the first `=` per line splits key from value.',
    example:
      '# Database\nDATABASE_URL=postgres://user:pass@host/db\nREDIS_URL=redis://localhost:6379\n',
  })
  @IsString()
  rawEnv: string;
}
