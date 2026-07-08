import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import express from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import compression from 'compression';
import helmet from 'helmet';

import { AppModule } from './app.module';
import {
  API_DOCS_PATH,
  API_PREFIX,
  SWAGGER_BEARER_NAME,
  SWAGGER_DESCRIPTION,
  SWAGGER_TITLE,
  SWAGGER_VERSION,
} from './common/constants';
import { TransformInterceptor } from './common/interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.setGlobalPrefix(API_PREFIX);

  app.enableCors({
    origin: process.env.APP_URL
      ? process.env.APP_URL.split(',')
      : [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:3002',
          'http://localhost:3003',
          'http://localhost:8081',
          'http://192.168.0.122:8081',
          'http://192.168.0.122:8082',
          'http://localhost:8082',
        ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
  });

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(compression());

  const uploadsDir = join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsDir));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());

  app.enableShutdownHooks();

  const config = new DocumentBuilder()
    .setTitle(SWAGGER_TITLE)
    .setDescription(SWAGGER_DESCRIPTION)
    .setVersion(SWAGGER_VERSION)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: SWAGGER_BEARER_NAME,
        in: 'header',
      },
      SWAGGER_BEARER_NAME,
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(API_DOCS_PATH, app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);

  Logger.log(`Server running on http://localhost:${port}`, 'Bootstrap');
  Logger.log(`Swagger docs at http://localhost:${port}/${API_DOCS_PATH}`, 'Bootstrap');
}

bootstrap();
