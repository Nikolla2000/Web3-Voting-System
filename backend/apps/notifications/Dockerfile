# Dev-mode image: hot-reload via `nest start --watch`, source bind-mounted
# in by docker-compose.yml. Not a production build.
#
# Build context is backend/ (the Nest monorepo root), not this directory —
# this app imports @app/shared from libs/shared and needs the root
# package.json/tsconfig/nest-cli.json to build.
FROM node:24-alpine

# python3/make/g++: node-gyp needs these to build bcrypt's native binding.
# bcrypt is a dependency of the shared root package.json, installed
# regardless of which app's image this is.
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

CMD ["npx", "nest", "start", "notifications", "--watch"]
