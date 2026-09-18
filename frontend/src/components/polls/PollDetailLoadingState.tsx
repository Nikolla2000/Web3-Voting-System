export function PollDetailLoadingState() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
      <div className="overflow-hidden rounded-3xl border border-indigo-100/70 bg-white/80">
        <div className="aspect-[21/9] w-full animate-pulse bg-slate-100" />
        <div className="flex flex-col gap-3 p-6 sm:p-8">
          <div className="h-6 w-2/3 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="h-56 animate-pulse rounded-3xl border border-indigo-100/70 bg-white/80" />
        <div className="h-56 animate-pulse rounded-3xl border border-indigo-100/70 bg-white/80" />
      </div>
    </div>
  );
}
