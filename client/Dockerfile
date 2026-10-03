# syntax=docker/dockerfile:1.7
# ─────────────────────────────────────────────────────────────────────────────
# kanban-collab client — production image
#
# Stage 1 builds the Vite bundle (tsc type-check + vite build, which also emits
# precompressed .gz/.br siblings via vite-plugin-compression2).
# Stage 2 serves the static output with nginx and reverse-proxies /api and /ws
# to the backend, so the SPA calls its own origin — no CORS, and no build-time
# API URL baked into the bundle.
# ─────────────────────────────────────────────────────────────────────────────

ARG NODE_VERSION=22

# ── Stage 1: build ───────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: serve ───────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Our server block: SPA fallback + /api + /ws proxy + static compression.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# The built static bundle.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
