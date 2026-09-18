'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { PollSortOption, PollStatus } from '@/types/poll';
import { filterPolls, sortPolls } from '@/lib/polls/utils';
import { fetchPolls } from '@/lib/api/polls';
import { getApiErrorMessage } from '@/lib/api/errors';
import { PollsToolbar } from '@/components/polls/PollsToolbar';
import { PollsGrid } from '@/components/polls/PollsGrid';
import { PollsLoadingState } from '@/components/polls/PollsLoadingState';
import { PollsErrorState } from '@/components/polls/PollsErrorState';

const MAX_POLLS_PER_FETCH = 50;

export function PollsExplorer() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<PollStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<PollSortOption>('newest');

  const {
    data,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['polls'],
    queryFn: () => fetchPolls({ limit: MAX_POLLS_PER_FETCH }),
  });

  const visiblePolls = useMemo(() => {
    const filtered = filterPolls(data?.items ?? [], { query, status });
    return sortPolls(filtered, sortBy);
  }, [data, query, status, sortBy]);

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
      {isPending ? (
        <PollsLoadingState />
      ) : isError ? (
        <PollsErrorState message={getApiErrorMessage(error)} onRetry={() => refetch()} />
      ) : (
        <PollsGrid polls={visiblePolls} />
      )}
    </div>
  );
}
