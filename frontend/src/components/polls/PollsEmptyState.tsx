import { SearchX, Sparkles } from 'lucide-react';

interface PollsEmptyStateProps {
  hasActiveFilters: boolean;
}

export function PollsEmptyState({ hasActiveFilters }: PollsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-indigo-100 bg-white/50 py-20 text-center">
      {hasActiveFilters ? (
        <>
          <SearchX className="h-8 w-8 text-indigo-300" />
          <p className="text-sm text-slate-500">No polls match your search. Try a different keyword or filter.</p>
        </>
      ) : (
        <>
          <Sparkles className="h-8 w-8 text-indigo-300" />
          <p className="text-sm text-slate-500">No polls have been created yet. Be the first to create one!</p>
        </>
      )}
    </div>
  );
}