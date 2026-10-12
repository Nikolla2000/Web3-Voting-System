import type { ChatTurn } from '@/lib/api/chat';

interface ChatMessageBubbleProps {
  message: ChatTurn;
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
        }`}
      >
        {message.content || (!isUser && <span className="text-slate-400">Thinking…</span>)}
      </div>
    </div>
  );
}
