import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PollStatusBadge } from '@/components/polls/PollStatusBadge';

// Verifies the test toolchain itself, not app behaviour: jsdom environment, `@/` path alias,
// TSX/JSX transform against React 19, Testing Library, and per-test localStorage isolation.
describe('test tooling', () => {
  it('renders a React 19 component through the @/ alias', () => {
    render(<PollStatusBadge status="upcoming" />);
    expect(screen.getByText('Upcoming')).toBeTruthy();
  });

  it('writes to jsdom localStorage (part 1)', () => {
    window.localStorage.setItem('smoke', '1');
    expect(window.localStorage.getItem('smoke')).toBe('1');
  });

  it('starts with a clean localStorage regardless of order (part 2)', () => {
    expect(window.localStorage.getItem('smoke')).toBeNull();
  });
});
