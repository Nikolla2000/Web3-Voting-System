export function PollsPageHeader() {
  return (
    <div className="mx-auto mb-10 flex max-w-2xl flex-col items-center text-center">
      <span className="mb-4 inline-flex items-center rounded-full border border-indigo-100 bg-white/70 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-indigo-600 backdrop-blur-sm">
        On-chain · Transparent · Auditable
      </span>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
        Polls
      </h1>
      <p className="mt-3 text-balance text-base leading-relaxed text-slate-500">
        Browse the polls, cast your vote, and verify the results yourself. All anonymously, 
        stored on the Blockchain.
      </p>
    </div>
  );
}