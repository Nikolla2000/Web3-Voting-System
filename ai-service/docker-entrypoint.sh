#!/bin/sh
set -e

# grpc_gen/ is gitignored and plain generated Python (no native binaries,
# unlike Prisma/bcrypt), so it's safe to regenerate straight into the
# bind-mounted source on every start.
uv run python scripts/gen_proto.py
uv run alembic upgrade head

exec uv run python -m ai_service.main
