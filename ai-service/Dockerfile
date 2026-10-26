# Dev-mode image: hot-reload isn't wired up here (ai_service.main has no
# watch mode of its own, unlike the Node apps' `nest start --watch`) — a
# restart is needed after a code change. Not a production build.
#
# Build context is the REPO ROOT, not ai-service/ — scripts/gen_proto.py
# regenerates grpc_gen/ from .proto files that live in
# ../backend/libs/shared/src (ai.proto, polls.proto), a sibling of this
# project, so the image mirrors that same repo-root-relative layout
# (/repo/ai-service next to /repo/backend) instead of flattening it.
FROM python:3.12-slim

RUN pip install --no-cache-dir uv

WORKDIR /repo/ai-service

COPY ai-service/pyproject.toml ai-service/uv.lock ./
# --no-install-project: resolve/install dependencies only, in a layer that
# stays cached across source edits — uv needs the actual source tree
# (copied below) to build and install the local ai-service package itself.
# --group dev: grpc_tools.protoc (scripts/gen_proto.py) lives in the "dev"
# dependency-group, not the main dependencies.
RUN uv sync --group dev --no-install-project

COPY ai-service/ ./
# Baked in at build time, not bind-mounted — only ai-service/ is mounted
# for hot reload, so editing these shared .proto files needs an image
# rebuild (`docker compose build ai-service`) to pick up, same as any other
# Dockerfile COPY.
COPY backend/libs/shared /repo/backend/libs/shared

RUN uv sync --group dev

RUN chmod +x docker-entrypoint.sh

ENTRYPOINT ["./docker-entrypoint.sh"]
