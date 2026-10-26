#!/bin/sh
set -e

# Same reasoning as polls' entrypoint: no migrations/ directory exists for
# this app, so `db push` (not `migrate deploy`) is how its schema gets
# applied. --accept-data-loss because this runs unattended on every start.
cd apps/blockchain
npx prisma generate
npx prisma db push --accept-data-loss
cd /app

exec npx nest start blockchain --watch
