import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Renders inside a fresh QueryClient (no retries, so a rejected mock fails at once) and returns a
 * fast userEvent instance. `delay: null` skips per-keystroke timers; every key event still fires.
 */
export function renderWithQuery(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const user = userEvent.setup({ delay: null });
  return { ...render(ui, { wrapper }), queryClient, user };
}
