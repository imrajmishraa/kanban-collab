# ── Stage 1: Production dependencies only ──────────────────
FROM node:22-bookworm-slim AS deps
WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
 && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ── Stage 2: Build TypeScript ──────────────────────────────
FROM node:22-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build \
 && npm prune --omit=dev

# ── Stage 3: Runtime ───────────────────────────────────────
FROM node:22-bookworm-slim AS runner

ENV NODE_ENV=production
ENV PORT=5000

WORKDIR /app

# Create non-root user
RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs --create-home appuser

# Copy only what is needed
COPY --from=deps  --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=appuser:nodejs /app/dist         ./dist
COPY --chown=appuser:nodejs package.json ./

# Writable directories
RUN mkdir -p /app/logs /app/uploads \
 && chown -R appuser:nodejs /app/logs /app/uploads

USER appuser

EXPOSE 5000

# Healthcheck using native fetch (Node 18+)
HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 5000) + '/healthz').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "--enable-source-maps", "dist/main.js"]