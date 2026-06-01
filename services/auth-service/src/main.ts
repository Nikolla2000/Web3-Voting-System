import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser = require('cookie-parser');
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// for setup outside of gloal prefix api/v1
function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Auth Service API')
    .setDescription('Authentication & Authorization')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: false, 
  });
}


async function bootstrap() {
  const logger = new Logger('Bootstrap');
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    
    app.use(cookieParser())
    app.enableShutdownHooks();
    app.setGlobalPrefix('api/v1');

    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }));

    app.enableCors({
      origin: configService.get<string>('app.frontendUrl'),
      credentials: true,
    });

    if (configService.get<string>('app.nodeEnv') !== 'production') {
      setupSwagger(app);
    }

    
    const port = configService.get<number>('app.port');
    await app.listen(port);

    console.log(`Auth microservice is running on port ${port}`);

  } catch (error) {
    logger.error('Critical error during application bootstrap:', error);
    process.exit(1);
  }
}
bootstrap();


