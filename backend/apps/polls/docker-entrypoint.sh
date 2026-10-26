#!/bin/sh
set -e

# prisma.config.ts resolves its schema path and loads its .env relative to
# cwd, so this must run from the app's own directory. No migrations/
# directory exists for this app (schema was set up via `db push`, not
# `migrate`), so push is the equivalent of identity's migrate-deploy step.
# --accept-data-loss: this runs unattended on every start, so it can't sit
# waiting on an interactive confirmation prompt.
cd apps/polls
npx prisma generate
npx prisma db push --accept-data-loss
cd /app

exec npx nest start polls --watch
