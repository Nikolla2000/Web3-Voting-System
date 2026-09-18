import { Users } from 'lucide-react';
import type { PollOption } from '@/types/poll';
import { formatVoteCount, getLeadingOptionId, getTotalVotes } from '@/lib/polls/utils';
import { PollOptionBar } from '@/components/polls/PollOptionBar';

interface PollDetailOptionsProps {
  options: PollOption[];
}

export function PollDetailOptions({ options }: PollDetailOptionsProps) {
  const totalVotes = getTotalVotes(options);
  const leadingOptionId = getLeadingOptionId(options);

  return (
    <div className="rounded-3xl border border-indigo-100/70 bg-white/80 p-6 backdrop-blur-sm sm:p-8">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-slate-900">Results</h2>
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
          <Users className="h-3.5 w-3.5" />
          {formatVoteCount(totalVotes)} votes
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {options.map((option) => (
          <PollOptionBar
            key={option.id}
            option={option}
            totalVotes={totalVotes}
            isLeading={totalVotes > 0 && option.id === leadingOptionId}
          />
        ))}
      </div>
    </div>
  );
}
