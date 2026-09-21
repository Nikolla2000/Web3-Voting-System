import type { Poll } from '@/types/poll';
import { PollCard } from '@/components/polls/PollCard';
import { PollsEmptyState } from '@/components/polls/PollsEmptyState';

interface PollsGridProps {
  polls: Poll[];
  hasActiveFilters: boolean;
}

export function PollsGrid({ polls, hasActiveFilters }: PollsGridProps) {
  if (polls.length === 0) {
    return <PollsEmptyState hasActiveFilters={hasActiveFilters} />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {polls.map((poll) => (
        <PollCard key={poll.id} poll={poll} />
      ))}
    </div>
  );
}