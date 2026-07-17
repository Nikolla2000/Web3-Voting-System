import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from './email/email.service';
import { UserRegisteredPayload } from '@app/shared';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly emailService: EmailService) {}

  async handleUserRegistered(payload: UserRegisteredPayload): Promise<void> {
    const { email, userId } = payload;

    if (!email) {
      this.logger.warn(`user.registered за userId=${userId} без email — skip`);
      return;
    }

    await this.emailService.sendWelcomeEmail(email);
  }
}