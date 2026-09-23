import { cn } from '@/lib/utils';
import type { PollOption } from '@/types/poll';

interface PollVoteOptionPickerProps {
  options: PollOption[];
  selectedOptionId: string | null;
  onSelect: (optionId: string) => void;
  disabled?: boolean;
}

export function PollVoteOptionPicker({ options, selectedOptionId, onSelect, disabled }: PollVoteOptionPickerProps) {
  return (
    <div className="flex flex-col gap-2.5" role="radiogroup">
      {options.map((option) => {
        const isSelected = option.id === selectedOptionId;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onSelect(option.id)}
            className={cn(
              'flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-colors disabled:pointer-events-none disabled:opacity-60',
              isSelected
                ? 'border-indigo-400 bg-indigo-50/80 text-slate-900'
                : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/40',
            )}
          >
            <span
              className={cn(
                'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                isSelected ? 'border-indigo-500' : 'border-slate-300',
              )}
            >
              {isSelected && <span className="h-2 w-2 rounded-full bg-indigo-500" />}
            </span>
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
