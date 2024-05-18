import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

import { ICorsConfig } from './utils/types';
import { ValidationPipe } from '@nestjs/common';

import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // cors config
  const corsConfig = configService.get<ICorsConfig>('CORS_OPTIONS');
  app.enableCors(corsConfig);

  // global path prefix and versioning
  app.setGlobalPrefix('api/v1');

  // global validation pipe
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.use(cookieParser());

  // get config
  const port = configService.get('PORT') || 3001;

  await app.listen(port);

  console.log(`Server and socket are now listening on ${port}`);
}
bootstrap();
