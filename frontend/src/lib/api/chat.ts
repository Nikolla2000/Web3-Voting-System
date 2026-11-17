import { refreshSession } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/auth-store';

export interface ChatTurn {
  role: 'user' | 'model';
  content: string;
}

const UNAVAILABLE = 'The assistant is unavailable right now.';

function postChat(message: string, history: ChatTurn[]): Promise<Response> {
  const { accessToken } = useAuthStore.getState();

  return fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/polls/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ message, history }),
  });
}

/**
 * Streams the assistant's answer as text deltas from the gateway's SSE endpoint.
 *
 * This uses fetch, not apiClient (axios can't hand over a streaming body in the browser), so it
 * doesn't get the client's 401 handling for free: an expired access token is refreshed here
 * through the same shared refresh, and the request retried once.
 */
export async function* streamChat(message: string, history: ChatTurn[]): AsyncGenerator<string> {
  let res = await postChat(message, history);

  if (res.status === 401) {
    // Rejects (and expires the session) if the refresh cookie is no good either.
    await refreshSession();
    res = await postChat(message, history);
  }

  if (!res.ok || !res.body) {
    throw new Error(UNAVAILABLE);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    // The gateway always ends with a `done` or an error event; closing without either means the
    // connection dropped mid-answer, and a truncated answer must not pass for a complete one.
    if (done) throw new Error('The answer was cut off. Please try again.');

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop() ?? '';

    for (const rawEvent of events) {
      const lines = rawEvent.split('\n');
      const eventName = lines.find((line) => line.startsWith('event:'))?.slice('event:'.length).trim();
      const dataLine = lines.find((line) => line.startsWith('data:'));
      if (!dataLine) continue;

      const payload = JSON.parse(dataLine.slice('data:'.length).trim());
      if (eventName === 'done') return;
      if (payload.error) throw new Error(payload.error);
      if (payload.textDelta) yield payload.textDelta;
    }
  }
}
