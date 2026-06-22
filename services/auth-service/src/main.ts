import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser = require('cookie-parser');
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter, LoggingInterceptor } from './common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';


async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    
    app.use(cookieParser())
    app.enableShutdownHooks();
    app.setGlobalPrefix('api/v1');

    const reflector = app.get(Reflector);
    app.useGlobalGuards(new JwtAuthGuard(reflector));

    app.useGlobalFilters(new GlobalExceptionFilter());

    app.useGlobalInterceptors(
      new LoggingInterceptor(),
      // new TransformInterceptor()
    )

    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    }));

    // app.enableCors({
    //   origin: configService.get<string>('app.frontendUrl'),
    //   credentials: true,
    // });

    const port = configService.get<number>('app.port');
    
    if (configService.get<string>('app.nodeEnv') !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('Auth Service API')
        .setDescription('Authentication & Authorization')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('docs', app, document);
      logger.log(`Swagger docs available at http://localhost:${port}/docs`);
    }

    await app.listen(port);

    logger.log(`Auth microservice is running on port ${port}`);

  } catch (error) {
    logger.error('Critical error during application bootstrap:', error);
    process.exit(1);
  }
}
bootstrap();


