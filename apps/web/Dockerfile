FROM oven/bun:1.3.13 AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock turbo.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages packages
RUN bun install --frozen-lockfile

FROM deps AS builder
COPY . .
RUN bun --filter @mediclinicpro/web build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app .
EXPOSE 3000
CMD ["bun", "--filter", "@mediclinicpro/web", "start"]
