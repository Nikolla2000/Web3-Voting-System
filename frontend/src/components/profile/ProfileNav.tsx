'use client';

import { ShieldCheck, TriangleAlert, UserRound, type LucideIcon } from 'lucide-react';

export type ProfileSectionId = 'account' | 'security' | 'danger';

interface ProfileSectionMeta {
  id: ProfileSectionId;
  label: string;
  icon: LucideIcon;
}

const SECTIONS: ProfileSectionMeta[] = [
  { id: 'account', label: 'Account details', icon: UserRound },
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'danger', label: 'Danger zone', icon: TriangleAlert },
];

interface ProfileNavProps {
  active: ProfileSectionId;
  onChange: (id: ProfileSectionId) => void;
}

export function ProfileNav({ active, onChange }: ProfileNavProps) {
  return (
    <nav className="flex gap-2 overflow-x-auto pb-1 lg:w-56 lg:shrink-0 lg:flex-col lg:overflow-visible lg:border-l lg:border-slate-100 lg:pb-0 lg:pl-3">
      {SECTIONS.map(({ id, label, icon: Icon }) => {
        const isActive = id === active;
        const isDanger = id === 'danger';

        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`group flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-colors lg:-ml-3 lg:shrink lg:border-l-2 lg:pl-[calc(0.75rem-2px)] cursor-pointer ${
              isActive
                ? isDanger
                  ? 'bg-red-50 text-red-600 lg:border-red-400'
                  : 'bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 lg:border-indigo-500'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 lg:border-transparent'
            }`}
          >
            <Icon
              className={`h-4 w-4 shrink-0 ${
                isActive ? (isDanger ? 'text-red-500' : 'text-indigo-500') : 'text-slate-400 group-hover:text-slate-500'
              }`}
            />
            <span className="whitespace-nowrap">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
