// notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { EmailService } from './email/email.service';

@Module({
  providers: [NotificationsService, EmailService],
  exports: [NotificationsService],
})
export class WelcomeEmailModule {}