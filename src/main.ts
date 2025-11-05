import { VersioningType } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule, AppExceptionFilter } from '~/app';
import { EnvironmentVariables } from '~/environment-variables';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  app.set('trust proxy', 'loopback'); // Trust requests from the loopback address

  app.enableCors({
    origin: '*',
  });

  const env = app.get(EnvironmentVariables);

  console.log(`Server is running on port ${env.PORT}`);

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AppExceptionFilter(httpAdapterHost));

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  await app.listen(env.PORT);
}
bootstrap();
