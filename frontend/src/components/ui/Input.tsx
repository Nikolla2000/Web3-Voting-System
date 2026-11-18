import { forwardRef, type InputHTMLAttributes } from 'react';
import { useFieldA11y } from '@/components/ui/use-field-a11y';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      id,
      name,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      ...props
    },
    ref,
  ) => {
    const { controlId, errorId, controlProps } = useFieldA11y({
      id,
      name,
      error,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
    });

    return (
      <div className="flex flex-col gap-1.5 text-left">
        <label htmlFor={controlId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
        <input
          name={name}
          ref={ref}
          className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${
            error ? 'border-red-300' : 'border-slate-200'
          }`}
          {...props}
          {...controlProps}
        />
        {error && (
          <span id={errorId} className="text-xs text-red-500">
            {error}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
