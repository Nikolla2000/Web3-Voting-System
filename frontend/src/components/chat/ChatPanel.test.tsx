import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { streamChat, type ChatTurn } from '@/lib/api/chat';
import { useAuthStore } from '@/lib/store/auth-store';

vi.mock('@/lib/api/chat', () => ({ streamChat: vi.fn() }));

/**
 * A stream the test drives by hand: push() yields a delta, end() finishes, fail() throws.
 * Each call to streamChat gets the next one, so a test can hold a stream open mid-answer.
 */
function controllableStream() {
  const queue: Array<{ value?: string; error?: Error; end?: boolean }> = [];
  let wake: (() => void) | null = null;
  const enqueue = (item: (typeof queue)[number]) => {
    queue.push(item);
    wake?.();
  };
  async function* generator(): AsyncGenerator<string> {
    while (true) {
      if (queue.length === 0) await new Promise<void>((resolve) => (wake = resolve));
      const item = queue.shift()!;
      if (item.error) throw item.error;
      if (item.end) return;
      yield item.value!;
    }
  }
  return {
    generator,
    push: (value: string) => enqueue({ value }),
    end: () => enqueue({ end: true }),
    fail: (message = 'boom') => enqueue({ error: new Error(message) }),
  };
}

function setup() {
  const user = userEvent.setup({ delay: null });
  render(<ChatPanel />);
  const input = screen.getByPlaceholderText('Ask a question…');
  const send = screen.getByRole('button', { name: 'Send' });
  const ask = async (text: string) => {
    await user.type(input, text);
    await user.click(send);
  };
  return { user, input, send, ask };
}

/** The conversation as a screen reader gets it: each message, prefixed with who said it. */
function conversation(): string[] {
  const log = screen.getByRole('log', { name: 'Conversation' });
  return Array.from(log.children, (el) => el.textContent ?? '');
}

beforeAll(() => {
  // jsdom implements no layout, so elements have no scrollTo.
  Element.prototype.scrollTo = vi.fn();
});

describe('ChatPanel', () => {
  it('starts with example prompts and a disabled send button', () => {
    const { send } = setup();

    expect(screen.getByText(/which poll has the most votes/)).toBeInTheDocument();
    expect(send).toBeDisabled();
  });

  it('does not send whitespace', async () => {
    const { user, input, send } = setup();

    await user.type(input, '   ');

    expect(send).toBeDisabled();
    await user.keyboard('{Enter}');
    expect(streamChat).not.toHaveBeenCalled();
  });

  it('shows the question at once, a thinking placeholder, then the answer as it streams in', async () => {
    const stream = controllableStream();
    vi.mocked(streamChat).mockImplementation(stream.generator);
    const { input, ask } = setup();

    await ask('  Which poll ends next?  ');

    expect(streamChat).toHaveBeenCalledWith('Which poll ends next?', []);
    expect(input).toHaveValue('');
    expect(conversation()).toEqual(['You: Which poll ends next?', 'Assistant: Thinking…']);
    expect(screen.getByRole('log')).toHaveAttribute('aria-busy', 'true');

    stream.push('The bike lane ');
    await vi.waitFor(() => expect(conversation()[1]).toBe('Assistant: The bike lane '));
    stream.push('poll, on Friday.');
    stream.end();

    await vi.waitFor(() =>
      expect(conversation()[1]).toBe('Assistant: The bike lane poll, on Friday.'),
    );
    expect(conversation()).toEqual([
      'You: Which poll ends next?',
      'Assistant: The bike lane poll, on Friday.',
    ]);
    await vi.waitFor(() => expect(screen.getByRole('log')).toHaveAttribute('aria-busy', 'false'));
  });

  it('blocks a second question while an answer is still streaming', async () => {
    const stream = controllableStream();
    vi.mocked(streamChat).mockImplementation(stream.generator);
    const { user, input, send, ask } = setup();

    await ask('First?');
    await user.type(input, 'Second?');

    expect(send).toBeDisabled();
    await user.keyboard('{Enter}');
    expect(streamChat).toHaveBeenCalledTimes(1);

    stream.end();
    await vi.waitFor(() => expect(send).toBeEnabled());
  });

  it('sends the earlier turns as history with the next question, not the new one', async () => {
    const first = controllableStream();
    const second = controllableStream();
    vi.mocked(streamChat)
      .mockImplementationOnce(first.generator)
      .mockImplementationOnce(second.generator);
    const { send, ask } = setup();

    await ask('Most votes?');
    first.push('The bike lane poll.');
    first.end();
    await vi.waitFor(() => expect(screen.getByPlaceholderText('Ask a question…')).toHaveValue(''));
    await vi.waitFor(() => expect(conversation()[1]).toBe('Assistant: The bike lane poll.'));
    await vi.waitFor(() => expect(send).toBeDisabled()); // empty input, stream finished
    await ask('When does it end?');

    const history: ChatTurn[] = [
      { role: 'user', content: 'Most votes?' },
      { role: 'model', content: 'The bike lane poll.' },
    ];
    expect(streamChat).toHaveBeenLastCalledWith('When does it end?', history);
  });

  it('replaces a failed answer with an apology and lets the user ask again', async () => {
    const stream = controllableStream();
    vi.mocked(streamChat).mockImplementation(stream.generator);
    const { user, input, send, ask } = setup();

    await ask('Most votes?');
    stream.push('Half an ans');
    await vi.waitFor(() => expect(conversation()[1]).toBe('Assistant: Half an ans'));
    stream.fail('The answer was cut off.');

    await vi.waitFor(() =>
      expect(conversation()).toEqual([
        'You: Most votes?',
        "Assistant: Sorry, I couldn't get an answer that time.",
      ]),
    );
    await user.type(input, 'Retry');
    expect(send).toBeEnabled();
  });
});

describe('ChatWidget', () => {
  beforeEach(() => {
    useAuthStore.setState({ status: 'authenticated' });
  });

  it.each(['unauthenticated', 'loading', 'idle'] as const)('is not rendered when %s', (status) => {
    useAuthStore.setState({ status });
    const { container } = render(<ChatWidget />);

    expect(container).toBeEmptyDOMElement();
  });

  it('opens and closes the panel from its toggle', async () => {
    const user = userEvent.setup({ delay: null });
    render(<ChatWidget />);

    expect(screen.queryByPlaceholderText('Ask a question…')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Open poll assistant' }));
    expect(screen.getByPlaceholderText('Ask a question…')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close poll assistant' }));
    expect(screen.queryByPlaceholderText('Ask a question…')).not.toBeInTheDocument();
  });

  it('disappears when the user signs out while it is open', async () => {
    const user = userEvent.setup({ delay: null });
    const { container } = render(<ChatWidget />);
    await user.click(screen.getByRole('button', { name: 'Open poll assistant' }));

    useAuthStore.setState({ status: 'unauthenticated' });

    await vi.waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});
