import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Playwright build bakes a fake gateway URL into the bundle (NEXT_PUBLIC_* is inlined at
  // build time), so it gets its own output folder: otherwise a later `next start` would silently
  // serve that build. See playwright.config.ts.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Only applies with the webpack dev server (Docker's Dockerfile runs
  // `next dev --webpack` instead of the default Turbopack specifically for
  // this), and only takes effect when actually set — Docker Desktop on
  // Windows doesn't reliably propagate native fs change events across the
  // bind-mount boundary, so the webpack watcher needs to poll instead.
  ...(process.env.DOCKER_CONTAINER === "true" && {
    watchOptions: { pollIntervalMs: 1000 },
  }),
};

export default nextConfig;
