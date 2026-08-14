import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PollSortOption, PollStatus } from '@/types/poll';

const STATUS_FILTERS: { value: PollStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ended', label: 'Ended' },
];

const SORT_OPTIONS: { value: PollSortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'endingSoon', label: 'Ending soon' },
  { value: 'mostVotes', label: 'Most votes' },
  { value: 'alphabetical', label: 'A – Z' },
];

interface PollsToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  status: PollStatus | 'all';
  onStatusChange: (value: PollStatus | 'all') => void;
  sortBy: PollSortOption;
  onSortByChange: (value: PollSortOption) => void;
}

export function PollsToolbar({
  query,
  onQueryChange,
  status,
  onStatusChange,
  sortBy,
  onSortByChange,
}: PollsToolbarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search polls by title…"
            className="w-full rounded-full border border-slate-200 bg-white/80 py-2 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 outline-none backdrop-blur-sm transition-colors focus:border-indigo-300 sm:w-64"
          />
        </div>

        <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white/60 p-1 backdrop-blur-sm">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => onStatusChange(filter.value)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                status === filter.value
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800',
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-500">
        Sort by
        <select
          value={sortBy}
          onChange={(event) => onSortByChange(event.target.value as PollSortOption)}
          className="rounded-full border border-slate-200 bg-white/80 py-2 pl-3 pr-8 text-sm text-slate-700 outline-none backdrop-blur-sm transition-colors focus:border-indigo-300"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}