import { NestFactory } from '@nestjs/core';
import { NotificationsModule } from './notifications.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(
    NotificationsModule
  );
   app.enableShutdownHooks();
   Logger.log('Notification service is running', 'Bootstrap');
}
bootstrap();
