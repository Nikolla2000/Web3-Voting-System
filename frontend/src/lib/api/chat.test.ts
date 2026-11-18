import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { InternalAxiosRequestConfig } from 'axios';
import { respond } from '@/test/axios-adapter';

/** A streaming Response whose body arrives in exactly these chunks (strings or raw bytes). */
function sse(chunks: Array<string | Uint8Array>, init: ResponseInit = {}) {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks)
        controller.enqueue(typeof chunk === 'string' ? encoder.encode(chunk) : chunk);
      controller.close();
    },
  });
  return new Response(body, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
    ...init,
  });
}

const delta = (text: string) => `data: ${JSON.stringify({ textDelta: text })}\n\n`;
const DONE = 'event: done\ndata: {}\n\n';

async function collect(stream: AsyncGenerator<string>) {
  const out: string[] = [];
  for await (const chunk of stream) out.push(chunk);
  return out;
}

/** chat.ts and the client/store it refreshes through all hold module-level state. */
async function setup(accessToken: string | null = 'access-1') {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_API_GATEWAY_URL', 'https://api.example');
  const fetchMock = vi.fn<typeof fetch>();
  vi.stubGlobal('fetch', fetchMock);

  const { streamChat } = await import('@/lib/api/chat');
  const { apiClient } = await import('@/lib/api/client');
  const { useAuthStore } = await import('@/lib/store/auth-store');
  const handleSessionExpired = vi.fn();
  useAuthStore.setState({ accessToken, handleSessionExpired });

  const authOf = (call: number) =>
    new Headers(fetchMock.mock.calls[call]![1]!.headers).get('Authorization');
  return { streamChat, apiClient, useAuthStore, fetchMock, handleSessionExpired, authOf };
}

beforeEach(() => {
  vi.resetModules();
});

describe('streamChat', () => {
  it('POSTs the message and history to the gateway with the access token', async () => {
    const { streamChat, fetchMock, authOf } = await setup();
    fetchMock.mockResolvedValue(sse([DONE]));
    const history = [
      { role: 'user' as const, content: 'hi' },
      { role: 'model' as const, content: 'hello' },
    ];

    await collect(streamChat('Which poll is most popular?', history));

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('https://api.example/polls/chat');
    expect(init!.method).toBe('POST');
    expect(JSON.parse(init!.body as string)).toEqual({
      message: 'Which poll is most popular?',
      history,
    });
    expect(authOf(0)).toBe('Bearer access-1');
  });

  it('yields each text delta in order and stops at the done event', async () => {
    const { streamChat, fetchMock } = await setup();
    fetchMock.mockResolvedValue(sse([delta('The '), delta('bike lane '), delta('poll.'), DONE]));

    expect(await collect(streamChat('q', []))).toEqual(['The ', 'bike lane ', 'poll.']);
  });

  it('reassembles events split across network chunks, and several events in one chunk', async () => {
    const { streamChat, fetchMock } = await setup();
    const all = delta('one') + delta('two') + delta('three') + DONE;
    // Split at awkward places: mid-JSON, mid-separator, and two whole events in one chunk.
    fetchMock.mockResolvedValue(
      sse([all.slice(0, 9), all.slice(9, 27), all.slice(27, 28), all.slice(28)]),
    );

    expect(await collect(streamChat('q', []))).toEqual(['one', 'two', 'three']);
  });

  it('decodes a multi-byte character split across two chunks', async () => {
    const { streamChat, fetchMock } = await setup();
    const bytes = new TextEncoder().encode(delta('Zürich — 42 votes') + DONE);
    const cut = bytes.indexOf(0xc3) + 1; // inside the two-byte "ü"
    fetchMock.mockResolvedValue(sse([bytes.slice(0, cut), bytes.slice(cut)]));

    expect(await collect(streamChat('q', []))).toEqual(['Zürich — 42 votes']);
  });

  it('ignores anything after done', async () => {
    const { streamChat, fetchMock } = await setup();
    fetchMock.mockResolvedValue(sse([delta('kept'), DONE, delta('dropped')]));

    expect(await collect(streamChat('q', []))).toEqual(['kept']);
  });

  it('skips events with no data line, such as keep-alive comments', async () => {
    const { streamChat, fetchMock } = await setup();
    fetchMock.mockResolvedValue(sse([': keep-alive\n\n', delta('answer'), DONE]));

    expect(await collect(streamChat('q', []))).toEqual(['answer']);
  });

  it('throws the gateway’s error event, after yielding what came before it', async () => {
    const { streamChat, fetchMock } = await setup();
    fetchMock.mockResolvedValue(
      sse([
        delta('partial'),
        `data: ${JSON.stringify({ error: 'The assistant hit an error.' })}\n\n`,
      ]),
    );
    const seen: string[] = [];

    await expect(
      (async () => {
        for await (const chunk of streamChat('q', [])) seen.push(chunk);
      })(),
    ).rejects.toThrow('The assistant hit an error.');
    expect(seen).toEqual(['partial']);
  });

  // Regression: a stream that closed without `done` used to end quietly, so an answer cut off by
  // a dropped connection was shown as if it were complete.
  it('throws when the stream closes before the done event', async () => {
    const { streamChat, fetchMock } = await setup();
    fetchMock.mockResolvedValue(sse([delta('The bike lane poll ends on')]));

    await expect(collect(streamChat('q', []))).rejects.toThrow('The answer was cut off');
  });

  it.each([
    ['a server error', () => new Response('boom', { status: 502 })],
    ['a response with no body', () => new Response(null, { status: 200 })],
  ])('throws a friendly error for %s', async (_label, makeResponse) => {
    const { streamChat, fetchMock } = await setup();
    fetchMock.mockResolvedValue(makeResponse());

    await expect(collect(streamChat('q', []))).rejects.toThrow(
      'The assistant is unavailable right now.',
    );
  });

  describe('expired access token', () => {
    // Regression: streamChat bypasses apiClient, so it never got the 401 → refresh → retry, and
    // the chat broke once the 15-minute access token expired.
    it('refreshes once and retries with the new token', async () => {
      const { streamChat, apiClient, useAuthStore, fetchMock, authOf } = await setup('expired');
      apiClient.defaults.adapter = (async (config: InternalAxiosRequestConfig) =>
        respond(config, 200, { data: { accessToken: 'fresh' } })) as never;
      fetchMock
        .mockResolvedValueOnce(new Response(null, { status: 401 }))
        .mockResolvedValueOnce(sse([delta('ok'), DONE]));

      expect(await collect(streamChat('q', []))).toEqual(['ok']);
      expect(authOf(0)).toBe('Bearer expired');
      expect(authOf(1)).toBe('Bearer fresh');
      expect(useAuthStore.getState().accessToken).toBe('fresh');
    });

    it('does not retry a second time if the retried request is also unauthorised', async () => {
      const { streamChat, apiClient, fetchMock } = await setup('expired');
      const adapter = vi.fn(async (config: InternalAxiosRequestConfig) =>
        respond(config, 200, { data: { accessToken: 'fresh' } }),
      );
      apiClient.defaults.adapter = adapter as never;
      fetchMock.mockResolvedValue(new Response(null, { status: 401 }));

      await expect(collect(streamChat('q', []))).rejects.toThrow(
        'The assistant is unavailable right now.',
      );
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(adapter).toHaveBeenCalledTimes(1);
    });

    it('expires the session when the refresh fails too', async () => {
      const { streamChat, apiClient, fetchMock, handleSessionExpired } = await setup('expired');
      apiClient.defaults.adapter = (async (config: InternalAxiosRequestConfig) =>
        respond(config, 401, { message: 'Refresh token expired' })) as never;
      fetchMock.mockResolvedValue(new Response(null, { status: 401 }));

      await expect(collect(streamChat('q', []))).rejects.toBeDefined();
      expect(handleSessionExpired).toHaveBeenCalledOnce();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });
});
