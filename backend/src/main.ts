import { NestFactory } from '@nestjs/core';
import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import * as YAML from 'js-yaml';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import helmet from 'helmet';
import compression from 'compression';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(
    cookieParser(
      process.env.COOKIE_SECRET ?? 'dev-cookie-secret-change-me',
    ),
  );

  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );
  app.use(compression());

  const httpLogger = new Logger('HTTP');
  app.use((req: Request, res: Response, next: () => void) => {
    const start = Date.now();
    res.on('finish', () => {
      const ms = Date.now() - start;
      httpLogger.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
    });
    next();
  });

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.setGlobalPrefix('api/v1', {
    exclude: [
      { path: 'docs', method: RequestMethod.ALL },
      { path: 'docs-json', method: RequestMethod.ALL },
      { path: 'docs-yaml', method: RequestMethod.ALL },
      { path: 'yaml', method: RequestMethod.ALL },
    ],
  });

  const config = new DocumentBuilder()
    .setTitle('EnvSpace API')
    .setDescription(
      'Secure shared .env manager for dev teams. ' +
      'All secret values are encrypted server-side using libsodium. ' +
      'Auth uses httpOnly cookies (`access_token`, `refresh_token`). ' +
      'Call POST /api/v1/auth/login or POST /api/v1/auth/register; ' +
      'use POST /api/v1/auth/refresh to rotate. ' +
      'For Swagger “Try it out”, enable credentials and sign in first.',
    )
    .setVersion('1.0')
    .addCookieAuth('access_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'access_token',
      description: 'JWT access token (httpOnly cookie set by login/register/refresh)',
    })
    .addTag('auth', 'Registration, login, OAuth, session')
    .addTag('spaces', 'Team spaces management')
    .addTag('projects', 'Projects inside a space')
    .addTag('environments', 'Environments inside a project')
    .addTag('secrets', 'Secret key-value pairs inside an environment')
    .addTag('notifications', 'In-app notifications')
    .addTag('invites', 'Space invite token flow')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    yamlDocumentUrl: 'yaml',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/docs-yaml', (req: Request, res: Response) => {
    res.type('text/yaml; charset=utf-8');
    res.send(YAML.dump(document, { skipInvalid: true, noRefs: true }));
  });

  // Ensure modules are initialized before checking DB connectivity.
  await app.init();

  const dbLogger = new Logger('Database');
  try {
    const prisma = app.get(PrismaService);
    await prisma.$queryRaw`SELECT 1`;
    dbLogger.log('Database connection: OK');
  } catch (err) {
  }

  const port = process.env.PORT || 4000;
  await app.listen(port);
  // database connection: OK
  if (process.env.NODE_ENV === 'development') {
    try {
      const prisma = app.get(PrismaService);
      await prisma.$queryRaw`SELECT 1`;
      console.log('Database connection: OK');
    } catch (err) {
      const stack = err instanceof Error ? err.stack : undefined;
      dbLogger.error('Database connection: FAILED', stack);
      throw err;
    }
    console.log(`EnvSpace API running on http://localhost:${port}/api/v1`);
    console.log(`Swagger UI: http://localhost:${port}/docs`);
    console.log(`OpenAPI YAML: http://localhost:${port}/yaml`);
    console.log(`OpenAPI JSON: http://localhost:${port}/docs-json`);
  } else {
    console.log(`EnvSpace API running on ${process.env.API_URL}/api/v1`);
  }
}
bootstrap();
