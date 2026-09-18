export function PollsLoadingState() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col overflow-hidden rounded-2xl border border-indigo-100/70 bg-white/80"
        >
          <div className="aspect-[16/9] w-full animate-pulse bg-slate-100" />
          <div className="flex flex-col gap-4 p-5">
            <div className="space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
            </div>
            <div className="space-y-2.5">
              {Array.from({ length: 3 }).map((__, barIndex) => (
                <div key={barIndex} className="h-1.5 w-full animate-pulse rounded-full bg-slate-100" />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
