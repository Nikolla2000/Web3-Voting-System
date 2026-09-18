import { AlertTriangle } from 'lucide-react';
import { PollDetailBackLink } from '@/components/polls/PollDetailBackLink';

interface PollDetailErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function PollDetailErrorState({ message, onRetry }: PollDetailErrorStateProps) {
  return (
    <div className="flex flex-col gap-6">
      <PollDetailBackLink />
      <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-red-100 bg-white/50 py-20 text-center">
        <AlertTriangle className="h-8 w-8 text-red-300" />
        <p className="text-sm text-slate-500">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-500"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
