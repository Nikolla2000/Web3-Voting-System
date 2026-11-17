import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { test as base, expect, type BrowserContext } from '@playwright/test';
import { MockGateway } from './mock-gateway';

export { expect };

const ARTIFACTS_HOST = 'https://snark-artifacts.pse.dev';
const CACHE_DIR = path.join(__dirname, '..', '.cache', 'snark-artifacts');

/**
 * Semaphore's prover downloads its circuit (wasm + zkey) from a CDN on first use. Serve it from a
 * local cache so only the very first run needs the network, and a CDN hiccup can't fail a test.
 */
async function cacheSnarkArtifacts(context: BrowserContext) {
  await context.route(`${ARTIFACTS_HOST}/**`, async (route) => {
    const url = new URL(route.request().url());
    const file = path.join(CACHE_DIR, url.pathname.replace(/[^a-zA-Z0-9._/-]/g, '_'));
    if (!existsSync(file)) {
      const response = await route.fetch();
      if (!response.ok()) return route.fulfill({ response });
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, await response.body());
    }
    return route.fulfill({
      body: await readFile(file),
      headers: { 'access-control-allow-origin': '*', 'content-type': 'application/octet-stream' },
    });
  });
}

export const test = base.extend<{ gateway: MockGateway }>({
  gateway: [
    async ({ context }, use) => {
      const gateway = new MockGateway();
      await gateway.install(context);
      await cacheSnarkArtifacts(context);
      await use(gateway);
      // A request the mock doesn't know means the app called an endpoint this suite never
      // modelled, so the test proved less than it claims.
      expect(gateway.unhandled, 'gateway requests with no mock handler').toEqual([]);
    },
    { auto: true },
  ],
});
