# ---------- BASE ----------
FROM node:22 AS base

WORKDIR /usr/src/app

COPY shared ./shared
COPY pnpm-lock.yaml ./
COPY turbo.json ./
COPY package.json ./
COPY pnpm-workspace.yaml ./
COPY tsconfig.base.json ./
COPY proto ./proto


COPY services/streaming/package*.json ./services/streaming/
COPY services/streaming/jest.config.js ./services/streaming/
COPY services/streaming/tsconfig.json ./services/streaming/
COPY services/streaming/src ./services/streaming/src/
COPY services/streaming/__tests__ ./services/streaming/__tests__/
COPY services/streaming/prisma ./services/streaming/prisma/

# ---------- BUILD ----------
FROM base AS build

ENV NODE_ENV=development

RUN apt-get update && apt-get install -y protobuf-compiler

RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

RUN pnpm fetch
RUN pnpm install --offline --frozen-lockfile

RUN mkdir -p ./services/streaming/src/grpc/generated
RUN pnpm run --filter streaming proto:generate

RUN pnpm --filter @shared/logger build
RUN pnpm --filter @shared/grpc-client-manager build
RUN pnpm --filter @shared/kafka-manager build
RUN pnpm --filter @shared/pg-boss-manager build

RUN pnpm --filter streaming prisma:generate
RUN pnpm --filter streaming build

RUN pnpm --filter streaming deploy /deploy --prod

# ---------- DEV ----------
FROM build AS dev

ENV NODE_ENV=development

COPY --from=base /usr/local/bin/corepack /usr/local/bin/corepack
RUN corepack enable
RUN corepack prepare pnpm@11.9.0 --activate

RUN chown -R node:node /usr/src/app

USER node

EXPOSE 50051
EXPOSE 8080

CMD ["pnpm", "--filter", "streaming", "start"]

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD nc -z localhost 50051 || exit 1

# ---------- PROD ----------
FROM node:22 AS prod

WORKDIR /usr/src/app

ENV NODE_ENV=production


COPY --from=build /deploy .

USER node

EXPOSE 50051
EXPOSE 8080

CMD ["node", "dist/app.js"]

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD nc -z localhost 50051 || exit 1


## ---------- PREDEPLOY ----------
FROM build AS predeploy
WORKDIR /usr/src/app/services/streaming
CMD ["npx", "prisma", "migrate", "deploy", "--schema=prisma/schema.prisma"]
