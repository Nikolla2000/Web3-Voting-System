import { Test, TestingModule } from '@nestjs/testing';
import { ConsumeMessage } from 'amqplib';
import {
  RABBITMQ_EXCHANGE,
  ROUTING_KEYS,
  RabbitMQConnectionService,
} from '@app/shared';
import { RabbitMQConsumerService } from './rabbitmq-consumer.service';
import { NotificationsService } from '../notifications/notifications.service';
import { QUEUES } from './rabbitmq.constants';

/**
 * Covers this app's own hand-rolled RabbitMQConsumerService (distinct from
 * the shared lib's generic one `polls` uses) — specifically handleMessage's
 * ack/nack decisions: a successfully processed event is acked, while a
 * parse failure or a rejected handler is nacked WITHOUT requeue, so a
 * poison message is dropped once rather than redelivered forever. amqplib
 * itself is mocked — no real broker.
 */
describe('RabbitMQConsumerService', () => {
  let channel: {
    prefetch: jest.Mock;
    assertQueue: jest.Mock;
    bindQueue: jest.Mock;
    consume: jest.Mock;
    ack: jest.Mock;
    nack: jest.Mock;
  };
  let notificationsService: { handleUserRegistered: jest.Mock };
  let reconnectCallback: () => void | Promise<void>;
  let consumeCallback: (msg: ConsumeMessage | null) => Promise<void>;

  beforeEach(async () => {
    channel = {
      prefetch: jest.fn().mockResolvedValue(undefined),
      assertQueue: jest
        .fn()
        .mockResolvedValue({ queue: QUEUES.NOTIFICATION_USER_REGISTERED }),
      bindQueue: jest.fn().mockResolvedValue(undefined),
      consume: jest.fn((_queue: string, cb: typeof consumeCallback) => {
        consumeCallback = cb;
      }),
      ack: jest.fn(),
      nack: jest.fn(),
    };
    notificationsService = {
      handleUserRegistered: jest.fn().mockResolvedValue(undefined),
    };

    const connectionService = {
      getChannel: jest.fn(() => channel),
      onReconnect: jest.fn((cb: typeof reconnectCallback) => {
        reconnectCallback = cb;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RabbitMQConsumerService,
        { provide: RabbitMQConnectionService, useValue: connectionService },
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    module.get(RabbitMQConsumerService);
    await reconnectCallback();
  });

  function makeMessage(body: unknown): ConsumeMessage {
    return { content: Buffer.from(JSON.stringify(body)) } as ConsumeMessage;
  }

  it('binds the queue to the USER_REGISTERED routing key on the shared exchange', () => {
    expect(channel.bindQueue).toHaveBeenCalledWith(
      QUEUES.NOTIFICATION_USER_REGISTERED,
      RABBITMQ_EXCHANGE,
      ROUTING_KEYS.USER_REGISTERED,
    );
  });

  it('acks the message once the handler resolves', async () => {
    const msg = makeMessage({ userId: 'u1', email: 'a@b.com', username: 'a' });

    await consumeCallback(msg);

    expect(notificationsService.handleUserRegistered).toHaveBeenCalledWith({
      userId: 'u1',
      email: 'a@b.com',
      username: 'a',
    });
    expect(channel.ack).toHaveBeenCalledWith(msg);
    expect(channel.nack).not.toHaveBeenCalled();
  });

  it('nacks without requeue when the handler rejects, so the message is dropped rather than retried forever', async () => {
    notificationsService.handleUserRegistered.mockRejectedValue(
      new Error('smtp down'),
    );
    const msg = makeMessage({ userId: 'u1', email: 'a@b.com', username: 'a' });

    await consumeCallback(msg);

    expect(channel.nack).toHaveBeenCalledWith(msg, false, false);
    expect(channel.ack).not.toHaveBeenCalled();
  });

  it('nacks without requeue, instead of crashing, on an unparsable message body', async () => {
    const msg = { content: Buffer.from('not valid json') } as ConsumeMessage;

    await consumeCallback(msg);

    expect(channel.nack).toHaveBeenCalledWith(msg, false, false);
    expect(notificationsService.handleUserRegistered).not.toHaveBeenCalled();
  });

  it('does nothing for a null message (consumer cancellation notice)', async () => {
    await consumeCallback(null);

    expect(channel.ack).not.toHaveBeenCalled();
    expect(channel.nack).not.toHaveBeenCalled();
  });
});
