// Merged into every app's webpack config via nest-cli.json's top-level
// compilerOptions.webpackConfigPath. Only touches watch behavior, and only
// inside Docker (DOCKER_CONTAINER=true, set in docker-compose.yml) — native
// `nest start --watch` keeps using native fs events, which work fine there.
//
// Docker Desktop on Windows doesn't reliably propagate native fs change
// events across the bind-mount boundary into the container, so webpack's
// watcher (watchpack) needs to poll the filesystem instead.
module.exports = function (options) {
  if (process.env.DOCKER_CONTAINER === 'true') {
    options.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
  }
  return options;
};
