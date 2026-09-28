import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface SectionCardProps {
  eyebrow: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  tone?: 'default' | 'danger';
  children: ReactNode;
}

export function SectionCard({ eyebrow, title, description, icon: Icon, tone = 'default', children }: SectionCardProps) {
  const isDanger = tone === 'danger';

  return (
    <div
      className={`rounded-3xl border p-6 backdrop-blur-sm sm:p-8 ${
        isDanger ? 'border-red-100 bg-white/80' : 'border-indigo-100/70 bg-white/80'
      }`}
    >
      <div className="mb-5 flex items-start gap-3.5">
        {Icon && (
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              isDanger ? 'bg-red-50 text-red-500' : 'bg-indigo-50 text-indigo-500'
            }`}
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
        <div>
          <span
            className={`font-mono text-[10px] uppercase tracking-[0.14em] ${isDanger ? 'text-red-400' : 'text-indigo-400'}`}
          >
            {eyebrow}
          </span>
          <h2 className={`font-display text-lg font-semibold ${isDanger ? 'text-red-600' : 'text-slate-900'}`}>
            {title}
          </h2>
          {description && <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>}
        </div>
      </div>

      {children}
    </div>
  );
}
