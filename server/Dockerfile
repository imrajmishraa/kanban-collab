# syntax=docker/dockerfile:1.7
# ─────────────────────────────────────────────────────────────────────────────
# kanban-collaboration-server — production image
#
# Multi-stage build:
#   deps   → production-only node_modules (native modules compiled here)
#   build  → full deps + TypeScript compiled to dist/
#   runner → minimal runtime: dist + prod node_modules, non-root, no toolchain
#
# The final image ships NO compilers and NO dev dependencies, and runs as a
# non-root user. Build tools live only in the `deps` stage, which is discarded.
# ─────────────────────────────────────────────────────────────────────────────

ARG NODE_VERSION=22

# ── Stage 1: production dependencies ─────────────────────────────────────────
FROM node:${NODE_VERSION}-bookworm-slim AS deps
WORKDIR /app

# Toolchain for native modules (bcrypt). Kept out of the runtime image.
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
 && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ── Stage 2: build (TypeScript → dist) ───────────────────────────────────────
FROM node:${NODE_VERSION}-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.build.json ./
COPY src ./src

RUN npm run build

# ── Stage 3: runtime ─────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-bookworm-slim AS runner

ENV NODE_ENV=production \
    PORT=3000

WORKDIR /app

RUN groupadd --system --gid 1001 nodejs \
 && useradd  --system --uid 1001 --gid nodejs --create-home appuser

COPY --from=deps  --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=appuser:nodejs /app/dist         ./dist
COPY --chown=appuser:nodejs package.json ./

# Only uploads is written at runtime — logs go to stdout in production.
RUN mkdir -p /app/uploads \
 && chown -R appuser:nodejs /app/uploads

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "--enable-source-maps", "--disable-warning=ExperimentalWarning", "dist/main.js"]
