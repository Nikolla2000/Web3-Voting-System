import { Test, TestingModule } from '@nestjs/testing';
import { UserRegisteredPayload } from '@app/shared';
import { NotificationsService } from './notifications.service';
import { EmailService } from './email/email.service';

/**
 * Covers NotificationsService.handleUserRegistered — the one real decision
 * here is skipping silently when a USER_REGISTERED event carries no email
 * (rather than crashing the consumer, which would nack-and-drop the whole
 * event). EmailService is mocked.
 */
describe('NotificationsService', () => {
  let service: NotificationsService;
  let emailService: { sendWelcomeEmail: jest.Mock };

  const payload: UserRegisteredPayload = {
    userId: 'user-1',
    email: 'voter@example.com',
    username: 'voter',
    registeredViaGoogle: false,
  };

  beforeEach(async () => {
    emailService = { sendWelcomeEmail: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    service = module.get(NotificationsService);
  });

  it('sends the welcome email for a well-formed event', async () => {
    await service.handleUserRegistered(payload);

    expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith(
      'voter@example.com',
      'voter',
    );
  });

  it('skips sending when the event has no email, instead of throwing', async () => {
    await expect(
      service.handleUserRegistered({ ...payload, email: '' }),
    ).resolves.toBeUndefined();

    expect(emailService.sendWelcomeEmail).not.toHaveBeenCalled();
  });
});
