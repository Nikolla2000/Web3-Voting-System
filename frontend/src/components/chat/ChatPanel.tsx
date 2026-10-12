'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Send } from 'lucide-react';
import { streamChat, type ChatTurn } from '@/lib/api/chat';
import { ChatMessageBubble } from '@/components/chat/ChatMessageBubble';

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || isStreaming) return;

    const history = messages;
    setInput('');
    setMessages([...history, { role: 'user', content: message }, { role: 'model', content: '' }]);
    setIsStreaming(true);

    try {
      for await (const delta of streamChat(message, history)) {
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last) next[next.length - 1] = { role: 'model', content: last.content + delta };
          return next;
        });
      }
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { role: 'model', content: "Sorry, I couldn't get an answer that time." };
        return next;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex h-[28rem] w-80 flex-col overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-[0_24px_60px_-20px_rgba(79,70,229,0.35)] sm:w-96">
      <div className="border-b border-slate-100 px-4 py-3">
        <p className="text-sm font-semibold text-slate-800">Ask about polls</p>
        <p className="text-xs text-slate-400">Vote counts, dates, status — grounded in live data.</p>
      </div>

      <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="text-sm text-slate-400">
            Try “which poll has the most votes?” or “when does the bike lane poll end?”
          </p>
        )}
        {messages.map((message, index) => (
          <ChatMessageBubble key={index} message={message} />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-slate-100 p-3">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask a question…"
          className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-300"
        />
        <button
          type="submit"
          disabled={isStreaming || input.trim().length === 0}
          aria-label="Send"
          className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:pointer-events-none disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
