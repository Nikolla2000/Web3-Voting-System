#!/bin/sh
set -e

# prisma.config.ts resolves its schema/migrations paths and loads its .env
# relative to cwd, so these must run from the app's own directory.
cd apps/identity
npx prisma generate
npx prisma migrate deploy
cd /app

exec npx nest start identity --watch
