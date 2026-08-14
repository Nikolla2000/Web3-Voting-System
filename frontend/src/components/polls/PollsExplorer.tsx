'use client';

import { useMemo, useState } from 'react';
import type { Poll, PollSortOption, PollStatus } from '@/types/poll';
import { filterPolls, sortPolls } from '@/lib/polls/utils';
import { PollsToolbar } from '@/components/polls/PollsToolbar';
import { PollsGrid } from '@/components/polls/PollsGrid';

interface PollsExplorerProps {
  initialPolls: Poll[];
}

export function PollsExplorer({ initialPolls }: PollsExplorerProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<PollStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<PollSortOption>('newest');

  const visiblePolls = useMemo(() => {
    const filtered = filterPolls(initialPolls, { query, status });
    return sortPolls(filtered, sortBy);
  }, [initialPolls, query, status, sortBy]);

  return (
    <div className="flex flex-col gap-6">
      <PollsToolbar
        query={query}
        onQueryChange={setQuery}
        status={status}
        onStatusChange={setStatus}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />
      <PollsGrid polls={visiblePolls} />
    </div>
  );
}