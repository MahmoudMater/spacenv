import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GitHubStrategy } from './strategies/github.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { TokenCleanupService } from './token-cleanup.service';
import { TokenService } from './token.service';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ session: false }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret:
          config.get<string>('JWT_ACCESS_SECRET') ??
          'dev-access-secret-change-me',
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    TokenService,
    JwtAuthGuard,
    GoogleStrategy,
    GitHubStrategy,
    TokenCleanupService,
  ],
  controllers: [AuthController],
  exports: [JwtAuthGuard, TokenService, AuthService],
})
export class AuthModule {}
