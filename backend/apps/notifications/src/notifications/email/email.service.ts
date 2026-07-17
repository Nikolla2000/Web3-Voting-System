import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('email.host'),
      port: this.configService.get<number>('email.port'),
      secure: this.configService.get<boolean>('email.secure'), // true for port 465
      auth: {
        user: this.configService.get<string>('email.user'),
        pass: this.configService.get<string>('email.pass'),
      },
    });
  }

  async sendWelcomeEmail(to: string, firstName?: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('email.from'),
        to,
        subject: 'Welcome to the Web3 Voting System',
        html: this.buildWelcomeTemplate(firstName),
      });
      this.logger.log(`Welcome email send → ${to}`);
    } catch (err: any) {
      // not throw err above, message is already acked in the consumer
      // Failed sending of email should not block the queue
      this.logger.error(`Failed sending email to ${to}: ${err.message}`);
    }
  }

  private buildWelcomeTemplate(firstName?: string): string {
    const greeting = firstName ? `Hello, ${firstName}!` : 'Hello!';
    return `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>${greeting}</h2>
        <p>Your registration in the Voting System is successfull.</p>
        <p>You can now participate in the polls.</p>
      </div>
    `;
  }
}