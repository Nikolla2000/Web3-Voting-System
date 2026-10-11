'use client';

import { useState, type FormEvent } from 'react';
import { Sparkles, X } from 'lucide-react';

interface PollsAiSearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  isSearching: boolean;
  isActive: boolean;
}

export function PollsAiSearchBar({ onSearch, onClear, isSearching, isActive }: PollsAiSearchBarProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (value.trim().length > 0) onSearch(value.trim());
  };

  const handleClear = () => {
    setValue('');
    onClear();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 rounded-2xl border border-indigo-100 bg-white/60 p-4 backdrop-blur-sm sm:flex-row sm:items-center"
    >
      <div className="relative flex-1">
        <Sparkles className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-300" />
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Or ask in plain English, e.g. “climate polls from last month”"
          className="w-full rounded-full border border-slate-200 bg-white/80 py-2 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition-colors focus:border-indigo-300"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSearching || value.trim().length === 0}
          className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:pointer-events-none disabled:opacity-50"
        >
          {isSearching ? 'Searching…' : 'Search'}
        </button>
        {isActive && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear AI search"
            className="rounded-full border border-slate-200 p-2 text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}
