import { SearchX } from 'lucide-react';

export function PollsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-indigo-100 bg-white/50 py-20 text-center">
      <SearchX className="h-8 w-8 text-indigo-300" />
      <p className="text-sm text-slate-500">No polls match your search. Try a different keyword or filter.</p>
    </div>
  );
}