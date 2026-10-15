# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Base: Node runtime + OpenSSL (required by the Prisma schema engine)
# ---------------------------------------------------------------------------
FROM node:22-alpine AS base
RUN apk add --no-cache openssl
WORKDIR /app

# ---------------------------------------------------------------------------
# deps: all dependencies; `postinstall` generates the Prisma client
# ---------------------------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

# ---------------------------------------------------------------------------
# build: compile the NestJS app to /app/dist
# ---------------------------------------------------------------------------
FROM deps AS build
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN npm run build

# ---------------------------------------------------------------------------
# migrator: one-off job that applies migrations and seeds the database.
# Uses the full dependency set (Prisma CLI + tsx are dev dependencies).
# ---------------------------------------------------------------------------
FROM deps AS migrator
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed"]

# ---------------------------------------------------------------------------
# prod-deps: production dependencies only. Scripts are skipped because the
# Prisma client is already compiled into dist/; bcrypt ships prebuilt binaries.
# ---------------------------------------------------------------------------
FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# ---------------------------------------------------------------------------
# runtime: minimal image that runs the API as a non-root user
# ---------------------------------------------------------------------------
FROM base AS runtime
ENV NODE_ENV=production \
    PORT=3001
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./
USER node
EXPOSE 3001
CMD ["node", "dist/main"]
