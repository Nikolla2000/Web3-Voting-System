import { cn } from '@/lib/utils';
import type { PollOption } from '@/types/poll';
import { getVotePercentage } from '@/lib/polls/utils';

interface PollOptionBarProps {
  option: PollOption;
  totalVotes: number;
  isLeading?: boolean;
}

export function PollOptionBar({ option, totalVotes, isLeading }: PollOptionBarProps) {
  const percentage = getVotePercentage(option.votes, totalVotes);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className={cn('truncate text-slate-600', isLeading && 'font-semibold text-slate-900')}>
          {option.label}
        </span>
        <span className={cn('shrink-0 font-medium text-slate-400', isLeading && 'text-indigo-600')}>
          {percentage}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-[width] duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}