import { Loader2 } from 'lucide-react';

interface PollVoteProgressProps {
  label: string;
}

export function PollVoteProgress({ label }: PollVoteProgressProps) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-indigo-700">
      <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
      {label}
    </div>
  );
}
