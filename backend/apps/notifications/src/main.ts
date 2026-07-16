import { NestFactory } from '@nestjs/core';
import { NotificationsModule } from './notifications.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(NotificationsModule);
  await app.listen(process.env.port ?? 3002);

   app.enableShutdownHooks();
   Logger.log('Notification service is listening on port 3002', 'Bootstrap');
}
bootstrap();
