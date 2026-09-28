import { AlertTriangle } from 'lucide-react';

interface ProfileErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ProfileErrorState({ message, onRetry }: ProfileErrorStateProps) {
  return (
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
  );
}
