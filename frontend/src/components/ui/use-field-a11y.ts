import { useId } from 'react';

interface FieldA11yInput {
  id?: string;
  name?: string;
  error?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false' | 'grammar' | 'spelling';
}

/**
 * Shared by Input/Textarea/Select: ties the label and the visible error message to the control,
 * so assistive tech announces "invalid" plus the message — not just a red border.
 */
export function useFieldA11y({ id, name, error, ...aria }: FieldA11yInput) {
  const generatedId = useId();
  const controlId = id ?? name ?? generatedId;
  const errorId = `${controlId}-error`;

  const describedBy = [aria['aria-describedby'], error ? errorId : undefined]
    .filter(Boolean)
    .join(' ');

  return {
    controlId,
    errorId,
    controlProps: {
      id: controlId,
      'aria-invalid': error ? true : aria['aria-invalid'],
      'aria-describedby': describedBy || undefined,
    },
  };
}
