# Dev-mode image: hot-reload via `nest start --watch`, source bind-mounted
# in by docker-compose.yml. Not a production build.
#
# Build context is backend/ (the Nest monorepo root) — this app imports
# @app/shared from libs/shared and needs the root package.json/tsconfig/
# nest-cli.json to build.
FROM node:24-alpine

# python3/make/g++: node-gyp needs these to build bcrypt's native binding.
# openssl: Prisma's query engine (linux-musl target) needs it at runtime.
RUN apk add --no-cache python3 make g++ openssl

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN chmod +x apps/blockchain/docker-entrypoint.sh

ENTRYPOINT ["apps/blockchain/docker-entrypoint.sh"]
