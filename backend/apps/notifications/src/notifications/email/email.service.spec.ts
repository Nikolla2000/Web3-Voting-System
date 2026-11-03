import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailService } from './email.service';

jest.mock('nodemailer');

/**
 * Covers EmailService.sendWelcomeEmail — specifically that a failed send
 * never throws. The consumer acks the RabbitMQ message once this resolves
 * (see rabbitmq-consumer.service.spec.ts), so a real SMTP outage must not
 * turn into message redelivery loops; it's logged and swallowed instead.
 * nodemailer itself is mocked — no real network call.
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access --
 * jest.Mock's `.mock.calls` is typed `any[][]`, so indexing into it to
 * inspect the rendered HTML is inherently `any` here — not a production
 * typing issue to fix.
 */
describe('EmailService', () => {
  let service: EmailService;
  let sendMail: jest.Mock;
  const configValues: Record<string, unknown> = {
    'email.host': 'smtp.example.com',
    'email.port': 587,
    'email.secure': false,
    'email.user': 'noreply',
    'email.pass': 'secret',
    'email.from': 'noreply@example.com',
  };

  beforeEach(async () => {
    sendMail = jest.fn().mockResolvedValue(undefined);
    (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: { get: (key: string) => configValues[key] },
        },
      ],
    }).compile();

    service = module.get(EmailService);
  });

  it('sends the welcome email from the configured address, greeting the user by name', async () => {
    await service.sendWelcomeEmail('voter@example.com', 'voter');

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'noreply@example.com',
        to: 'voter@example.com',
        subject: 'Welcome to the Web3 Voting System',
        html: expect.stringContaining('Hello, voter!'),
      }),
    );
  });

  it('falls back to a generic greeting when no username is given', async () => {
    await service.sendWelcomeEmail('voter@example.com');

    const html = sendMail.mock.calls[0][0].html as string;
    expect(html).toContain('Hello!');
    expect(html).not.toContain('Hello, undefined');
  });

  it('swallows a transporter failure instead of throwing, so the consumer still acks', async () => {
    sendMail.mockRejectedValue(new Error('SMTP connection refused'));

    await expect(
      service.sendWelcomeEmail('voter@example.com', 'voter'),
    ).resolves.toBeUndefined();
  });
});
