import { Module } from '@nestjs/common';
import { SecretsService } from './secrets.service';
import { SecretsController } from './secrets.controller';
import { EnvironmentSecretsController } from './environment-secrets.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CryptoModule } from '../crypto/crypto.module';
import { EnvironmentsModule } from '../environments/environments.module';

@Module({
  imports: [
    PrismaModule,
    CryptoModule,
    EnvironmentsModule,
  ],
  controllers: [EnvironmentSecretsController, SecretsController],
  providers: [SecretsService],
  exports: [SecretsService],
})
export class SecretsModule {}
