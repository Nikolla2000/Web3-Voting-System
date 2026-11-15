import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  // RTL only auto-cleans when Vitest globals are enabled; they aren't, so unmount explicitly.
  cleanup();
  // localStorage is real application state here (Semaphore voting identities, voted-tx markers —
  // see src/lib/voting/), so never let one test's writes leak into another.
  window.localStorage.clear();
});
