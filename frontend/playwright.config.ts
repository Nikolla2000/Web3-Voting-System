import { defineConfig, devices } from '@playwright/test';
import { APP_URL, GATEWAY_URL } from './e2e/support/urls';

/**
 * End-to-end tests: a production build of the app in a real browser, with the API gateway mocked
 * at the network layer (e2e/support/mock-gateway.ts). Nothing here talks to the real backend; the
 * shared services behind it (CloudAMQP, Upstash, Sepolia) would make runs slow, flaky and costly.
 * The vote test still runs real zero-knowledge proving in the browser.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  // Generous for a cold start: the first requests to a fresh `next start`, while other workers
  // are busy proving, have been seen to take over the 5s default.
  expect: { timeout: 10_000 },
  use: {
    baseURL: APP_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // NEXT_PUBLIC_* is baked in at build time, so the build itself must point at the mock
    // gateway, and it gets its own folder so it never replaces the real one (next.config.ts).
    command: `npx next build && npx next start --hostname 127.0.0.1 --port ${new URL(APP_URL).port}`,
    url: APP_URL,
    env: { NEXT_PUBLIC_API_GATEWAY_URL: GATEWAY_URL, NEXT_DIST_DIR: '.next-e2e' },
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
