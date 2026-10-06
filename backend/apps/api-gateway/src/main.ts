import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { setupSwagger } from './config/swagger';
import cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') ?? 3000;
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    }
  }));

  app.use(cookieParser());

  const frontendUrl = configService.get<string>('app.frontendUrl');
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    // Rate-limit headers aren't on the CORS-safelisted response header list,
    // so the frontend can't read them (Retry-After in particular) unless
    // they're explicitly exposed here.
    exposedHeaders: ['Retry-After', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  });

  if (configService.get<string>('app.nodeEnv') !== 'production') {
    setupSwagger(app);
    logger.log(`Swagger docs available at http://localhost:${port}/docs`);
  }

  app.enableShutdownHooks();

  await app.listen(process.env.port ?? 3000);
  logger.log(`API Gateway running on port ${port}`);
}
bootstrap();
