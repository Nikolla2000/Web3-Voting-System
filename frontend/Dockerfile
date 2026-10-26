# Dev-mode image: hot-reload via `next dev`, source bind-mounted in by
# docker-compose.yml. Not a production build.
FROM node:24-alpine

WORKDIR /app

# husky's "prepare" script (run by `npm ci`) expects a .git directory,
# which isn't in the build context — HUSKY=0 skips its install instead of
# failing/warning during the build.
ENV HUSKY=0

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

CMD ["npm", "run", "dev"]
