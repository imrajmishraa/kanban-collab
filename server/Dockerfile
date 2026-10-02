FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
 && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ── Stage 2: compile TypeScript ────────────────────────────────────────────
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ── Stage 3: runtime ───────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS runner

# NODE_ENV=production is required: the logger picks pino-roll (a runtime dep)
# in production and pino-pretty (a dev-only dep) when NODE_ENV=development.
ENV NODE_ENV=production
WORKDIR /app

RUN groupadd --system --gid 1001 nodejs \
 && useradd  --system --uid 1001 --gid nodejs appuser

COPY --from=deps  --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=appuser:nodejs /app/dist         ./dist
COPY --chown=appuser:nodejs package.json ./

# Writable paths the app creates at runtime (logs/app.log, ./uploads).
RUN mkdir -p /app/logs /app/uploads \
 && chown -R appuser:nodejs /app/logs /app/uploads

USER appuser

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||5000)+'/healthz/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/main.js"]
