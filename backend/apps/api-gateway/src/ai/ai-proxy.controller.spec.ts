import { status as grpcStatus } from '@grpc/grpc-js';
import type { ClientGrpc } from '@nestjs/microservices';
import type { Response } from 'express';
import { of, throwError } from 'rxjs';
import { AiProxyController } from './ai-proxy.controller';

function setup(chat: jest.Mock) {
  const client = {
    getService: () => ({ chat }),
  } as unknown as ClientGrpc;
  const controller = new AiProxyController(client);
  controller.onModuleInit();

  const written: string[] = [];
  const end = jest.fn();
  const res = {
    setHeader: jest.fn(),
    write: jest.fn((chunk: string) => written.push(chunk)),
    end,
  } as unknown as Response;

  return { controller, res, written, end };
}

const dto = { message: 'Which poll has the most votes?', history: [] };

describe('AiProxyController.chat', () => {
  it('streams each chunk as an SSE event and ends with done', async () => {
    const { controller, res, written } = setup(
      jest.fn(() => of({ textDelta: 'Hello' })),
    );

    await controller.chat(dto, res);

    expect(written).toEqual([
      `data: ${JSON.stringify({ textDelta: 'Hello' })}\n\n`,
      'event: done\ndata: {}\n\n',
    ]);
  });

  it('tells the user to try again when ai-service is UNAVAILABLE', async () => {
    const { controller, res, written, end } = setup(
      jest.fn(() => throwError(() => ({ code: grpcStatus.UNAVAILABLE }))),
    );

    await controller.chat(dto, res);

    expect(written).toEqual([
      `data: ${JSON.stringify({ error: 'The assistant is busy right now. Please try again in a minute.' })}\n\n`,
    ]);
    expect(end).toHaveBeenCalled();
  });

  it('reports any other failure as a generic error', async () => {
    const { controller, res, written } = setup(
      jest.fn(() => throwError(() => ({ code: grpcStatus.UNKNOWN }))),
    );

    await controller.chat(dto, res);

    expect(written).toEqual([
      `data: ${JSON.stringify({ error: 'The assistant hit an error.' })}\n\n`,
    ]);
  });
});
