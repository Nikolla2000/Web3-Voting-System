import { cn } from '@/lib/utils';
import type { PollStatus } from '@/types/poll';

const STATUS_STYLES: Record<PollStatus, { label: string; dot: string; text: string }> = {
  active: { label: 'Active', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  upcoming: { label: 'Upcoming', dot: 'bg-indigo-500', text: 'text-indigo-700' },
  ended: { label: 'Ended', dot: 'bg-slate-400', text: 'text-slate-500' },
};

interface PollStatusBadgeProps {
  status: PollStatus;
}

export function PollStatusBadge({ status }: PollStatusBadgeProps) {
  const { label, dot, text } = STATUS_STYLES[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm',
        text,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dot, status === 'active' && 'animate-pulse')} />
      {label}
    </span>
  );
}