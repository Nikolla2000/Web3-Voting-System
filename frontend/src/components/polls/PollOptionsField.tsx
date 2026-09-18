import { useFieldArray, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
import type { CreatePollFormValues } from '@/lib/validation/poll-schemas';

interface PollOptionsFieldProps {
  control: Control<CreatePollFormValues>;
  errors: FieldErrors<CreatePollFormValues>;
  register: UseFormRegister<CreatePollFormValues>;
}

export function PollOptionsField({ control, errors, register }: PollOptionsFieldProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'options' });

  const arrayError =
    errors.options?.root?.message ?? (typeof errors.options?.message === 'string' ? errors.options.message : undefined);

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-slate-700">Options</span>

      <div className="flex flex-col gap-2.5">
        {fields.map((field, index) => {
          const optionError = errors.options?.[index]?.value?.message;

          return (
            <div key={field.id} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <label htmlFor={`option-${field.id}`} className="sr-only">
                  {`Option ${index + 1}`}
                </label>
                <input
                  id={`option-${field.id}`}
                  placeholder={`Option ${index + 1}`}
                  className={`w-full flex-1 rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${
                    optionError ? 'border-red-300' : 'border-slate-200'
                  }`}
                  {...register(`options.${index}.value` as const)}
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  disabled={fields.length <= 2}
                  className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:pointer-events-none disabled:opacity-30"
                  aria-label={`Remove option ${index + 1}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {optionError && <span className="text-xs text-red-500">{optionError}</span>}
            </div>
          );
        })}
      </div>

      {arrayError && <span className="text-xs text-red-500">{arrayError}</span>}

      <button
        type="button"
        onClick={() => append({ value: '' })}
        className="inline-flex w-fit items-center gap-1.5 rounded-full border border-dashed border-indigo-200 px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:border-indigo-300 hover:bg-indigo-50"
      >
        <Plus className="h-3.5 w-3.5" />
        Add option
      </button>
    </div>
  );
}
