import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

type FieldProps = { label: string; name?: string; id?: string; error?: string; 'aria-describedby'?: string };

const fields: Array<[string, (props: FieldProps) => React.ReactElement]> = [
  ['Input', (props) => <Input {...props} />],
  ['Textarea', (props) => <Textarea {...props} />],
  ['Select', (props) => <Select options={[{ value: 'a', label: 'A' }]} {...props} />],
];

describe.each(fields)('%s accessibility', (_, renderField) => {
  it('is labelled and not marked invalid when there is no error', () => {
    render(renderField({ label: 'Title', name: 'title' }));
    const control = screen.getByLabelText('Title');

    expect(control).not.toBeInvalid();
    expect(control).not.toHaveAttribute('aria-describedby');
  });

  it('marks the control invalid and announces the error message as its description', () => {
    render(renderField({ label: 'Title', name: 'title', error: 'Title is required' }));
    const control = screen.getByLabelText('Title');

    expect(control).toBeInvalid();
    expect(control).toHaveAccessibleDescription('Title is required');
  });

  it('keeps a caller-supplied description alongside the error', () => {
    render(
      <>
        <p id="hint">Shown on the poll card</p>
        {renderField({ label: 'Title', name: 'title', error: 'Too short', 'aria-describedby': 'hint' })}
      </>,
    );

    expect(screen.getByLabelText('Title')).toHaveAccessibleDescription('Shown on the poll card Too short');
  });

  it('still links label and error when given neither id nor name', () => {
    render(
      <>
        {renderField({ label: 'First', error: 'First error' })}
        {renderField({ label: 'Second', error: 'Second error' })}
      </>,
    );

    expect(screen.getByLabelText('First')).toHaveAccessibleDescription('First error');
    expect(screen.getByLabelText('Second')).toHaveAccessibleDescription('Second error');
  });
});
