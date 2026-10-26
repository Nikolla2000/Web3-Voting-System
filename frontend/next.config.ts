import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
