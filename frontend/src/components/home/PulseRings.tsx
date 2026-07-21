export function PulseRings() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <span className="absolute h-[350px] w-[350px] animate-ring-pulse rounded-full border border-indigo-400/30" />
      <span className="absolute h-[350px] w-[350px] animate-ring-pulse rounded-full border border-violet-400/30 [animation-delay:1.3s]" />
      <span className="absolute h-[350px] w-[350px] animate-ring-pulse rounded-full border border-indigo-400/30 [animation-delay:2.6s]" />
    </div>
  );
}