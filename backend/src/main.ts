import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { Env } from './config/env.validation';
import { SWAGGER_PATH, setupSwagger } from './swagger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  app.enableCors({
    origin: config
      .get('CORS_ORIGINS', { infer: true })
      .split(',')
      .map((origin) => origin.trim()),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaExceptionFilter(httpAdapter));

  app.enableShutdownHooks();
  setupSwagger(app);

  const port = config.get('PORT', { infer: true });
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`API listening on http://localhost:${port}`);
  logger.log(`Swagger docs on http://localhost:${port}/${SWAGGER_PATH}`);
}

void bootstrap();
