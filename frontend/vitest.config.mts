import { defineConfig } from 'vitest/config';

// Deliberately leaner than Next's Vitest guide (node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md):
// Vite 8 resolves tsconfig `paths` natively and transforms JSX via Oxc (honouring tsconfig's
// `"jsx": "react-jsx"`), so `vite-tsconfig-paths` and `@vitejs/plugin-react` aren't needed —
// the latter only adds Fast Refresh, which is irrelevant under test.
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    // Every test starts from a clean slate regardless of execution order.
    // Vitest 4's restoreMocks only restores vi.spyOn spies; clearMocks is what wipes recorded
    // calls on module-mock vi.fn()s between tests.
    clearMocks: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/types/**'],
    },
  },
});
