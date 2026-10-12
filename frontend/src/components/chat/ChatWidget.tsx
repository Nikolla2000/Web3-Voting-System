'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import { ChatPanel } from '@/components/chat/ChatPanel';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.status === 'authenticated');

  if (!isAuthenticated) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && <ChatPanel />}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Close poll assistant' : 'Open poll assistant'}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_12px_30px_-8px_rgba(79,70,229,0.6)] transition-transform hover:-translate-y-0.5"
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>
    </div>
  );
}
