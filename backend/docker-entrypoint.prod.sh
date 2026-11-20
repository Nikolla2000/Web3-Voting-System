#!/bin/sh
# Entrypoint for Dockerfile.prod: syncs the app's own database schema, then
# starts the compiled app. Same schema steps as the dev entrypoints under
# apps/*/ (identity has migrations; polls and blockchain don't, so they use
# db push).
set -e

case "$APP" in
  identity)
    (cd apps/identity && npx prisma migrate deploy)
    ;;
  polls | blockchain)
    (cd "apps/$APP" && npx prisma db push --accept-data-loss)
    ;;
esac

exec node "dist/apps/$APP/main.js"
