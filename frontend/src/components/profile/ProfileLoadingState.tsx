export function ProfileLoadingState() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-40 animate-pulse rounded-3xl border border-indigo-100/70 bg-white/80" />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex gap-2 lg:w-56 lg:shrink-0 lg:flex-col">
          <div className="h-10 w-32 shrink-0 animate-pulse rounded-xl bg-slate-100 lg:w-full" />
          <div className="h-10 w-28 shrink-0 animate-pulse rounded-xl bg-slate-100 lg:w-full" />
          <div className="h-10 w-32 shrink-0 animate-pulse rounded-xl bg-slate-100 lg:w-full" />
        </div>
        <div className="h-72 min-w-0 flex-1 animate-pulse rounded-3xl border border-indigo-100/70 bg-white/80" />
      </div>
    </div>
  );
}
