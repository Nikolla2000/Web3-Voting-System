export function HexGrid() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(79,70,229,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(79,70,229,0.2) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage:
            'radial-gradient(ellipse 60% 50% at 50% 35%, black 20%, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 60% 50% at 50% 35%, black 20%, transparent 75%)',
        }}
      />

      <svg
        className="absolute -left-10 top-24 h-24 w-24 animate-drift-slow text-indigo-300/40"
        viewBox="0 0 100 100"
        fill="none"
      >
        <polygon
          points="50 3 93 25 93 75 50 97 7 75 7 25"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>

      <svg
        className="absolute right-[8%] top-40 h-16 w-16 animate-drift-slower text-violet-300/40"
        viewBox="0 0 100 100"
        fill="none"
      >
        <polygon
          points="50 3 93 25 93 75 50 97 7 75 7 25"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>

      <svg
        className="absolute bottom-16 left-[12%] h-14 w-14 animate-drift-slow text-indigo-200/50"
        viewBox="0 0 100 100"
        fill="none"
      >
        <polygon
          points="50 3 93 25 93 75 50 97 7 75 7 25"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>

      <svg
        className="absolute bottom-24 right-[16%] h-20 w-20 animate-drift-slower text-violet-200/50"
        viewBox="0 0 100 100"
        fill="none"
      >
        <polygon
          points="50 3 93 25 93 75 50 97 7 75 7 25"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}