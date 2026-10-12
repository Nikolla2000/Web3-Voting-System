import { useAuthStore } from '@/lib/store/auth-store';

export interface ChatTurn {
  role: 'user' | 'model';
  content: string;
}

export async function* streamChat(message: string, history: ChatTurn[]): AsyncGenerator<string> {
  const { accessToken } = useAuthStore.getState();

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/polls/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ message, history }),
  });

  if (!res.ok || !res.body) {
    throw new Error('The assistant is unavailable right now.');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) return;

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
