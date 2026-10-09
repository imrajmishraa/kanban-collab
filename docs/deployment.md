# Deployment

There are two supported ways to run Kanban-Collab: **Docker Compose** (self-hosted, everything in one stack) and **Render** (the blueprint in `render.yaml`). Both run the same server and client images.

## Option A — Docker Compose (self-hosted)

`docker-compose.yml` at the repo root brings up the whole stack:

| Service | Image / build | Host port | Notes |
|---|---|---|---|
| `web` | built from `client/` | **8080** | nginx serving the SPA, proxying `/api` and `/ws` to `api` |
| `api` | built from `server/` | 3000 | Node + Yjs backend |
| `mongo` | `mongo:7` | — | volume `mongo_data` |
| `cache` | `redis:7-alpine` | — | volume `redis_data`, AOF enabled |

```bash
# from the repo root
cp server/.env.example server/.env      # set JWT_SECRET + JWT_REFRESH_SECRET at minimum
docker compose up -d --build
docker compose logs -f
```

Compose overrides `MONGODB_URI` and `REDIS_URL` to the in-network hosts (`mongo`, `cache`) and sets `NODE_ENV=production`. Uploads persist in the `uploads` volume.

**Health gating:** `api` waits for `mongo` and `cache` to be healthy before starting, and `web` waits for `api`. The `api` healthcheck hits `/healthz`; Mongo uses `db.adminCommand('ping')`; Redis uses `redis-cli ping`.

Tear down:

```bash
docker compose down        # keep volumes
docker compose down -v     # drop mongo/redis/uploads volumes
```

## Option B — Render (`render.yaml`)

The blueprint defines two services:

1. **`kanban-collab-client`** — a **static** service (`rootDir: client`) that runs `npm ci && npm run build` and publishes `dist/`. It rewrites `/api/*` to the API service (server-side, so the browser stays on one origin — CORS and first-party cookies behave as behind nginx) and falls back to `/index.html` for the SPA. It also sets security headers and long-lived asset caching.
2. **`kanban-collab-server`** — the web API (Node). Set its environment variables in the Render dashboard (or sync them from `.env`). `RENDER_EXTERNAL_URL` is injected automatically.

CI deploys on `main` by calling the Render **deploy hooks** (`RENDER_DEPLOY_HOOK_API`, `RENDER_DEPLOY_HOOK_WEB`) after the server and client jobs pass — see `.github/workflows/ci-cd.yml`.

> The `/api/*` rewrite in `render.yaml` must come **before** the SPA catch-all, or the catch-all swallows API calls. This is already ordered correctly in the blueprint.

## Environment

The server validates its environment at boot (`server/src/config/env.ts`) and **exits 1** on a missing/invalid required variable. Only four variables have **no default**: `MONGODB_URI`, `REDIS_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`. `.env.example` documents every variable and the cross-field rules.

Notable differences between environments:

| Variable | Dev | Production |
|---|---|---|
| `NODE_ENV` | `development` | `production` |
| `COOKIE_SECURE` | unset → `false` | unset → **`true`** (or set explicitly) |
| cookie `SameSite` | `lax` | **`none`** (cross-site API/web) |
| `CORS_ORIGINS` | `http://localhost:5173,…` | the deployed web origin(s), CSV |
| `CLIENT_URL` | `http://localhost:5173` | the deployed web URL |
| `SELF_PING_URL` / `RENDER_EXTERNAL_URL` | blank | keep-alive target |
| `EMAIL_PROVIDER` | `console` | `smtp` / `ses` (real delivery) |

Production also refuses insecure JWT secrets (no `change-me`/`replace`) and requires the two secrets to differ.

## Build & run

**Server:**

```bash
cd server
npm ci
npm run build        # tsc → dist/  (prebuild runs typecheck)
npm start            # node dist/main.js
```

**Client:**

```bash
cd client
npm ci
npm run build        # tsc -b && vite build → dist/
```

## Health & probes

| Endpoint | Meaning | Use |
|---|---|---|
| `GET /healthz` | liveness — process is up | load balancer / restart policy |
| `GET /readyz` | readiness — Mongo + Redis reachable | route traffic only when `200` |
| `GET /websocket` | WebSocket-layer health | diagnostics |

`/readyz` returns `503` when any dependency is down, so an orchestrator stops sending it traffic without restarting it (a DB blip shouldn't cause a crash-loop).

## Background jobs

Cron jobs are started after the server listens (`SCHEDULER_ENABLED=true`). Schedules are configurable:

| Job | Env | Default |
|---|---|---|
| Notification digest | `NOTIF_DIGEST_CRON` | `0 8 * * *` |
| Due-date reminders | `NOTIF_DUE_REMINDER_CRON` | `*/15 * * * *` |
| Workspace deletion (hard delete of scheduled workspaces) | `WORKSPACE_CLEANUP_CRON` | `0 * * * *` |
| Self-ping (keep-alive) | `SELF_PING_CRON` | `*/10 * * * *` |
| Yjs snapshot | `YJS_SNAPSHOT_INTERVAL_MS` | every 5 min |

Jobs guard against overlapping runs.

## Keep-alive

On a free Render instance the service can spin down after inactivity. `SELF_PING_URL` (falling back to `RENDER_EXTERNAL_URL`) is pinged on the self-ping schedule to keep it warm. Leave both blank locally.

## Security headers & caching

Both nginx (`client/nginx.conf.template`) and `render.yaml` set:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=()`
- Hashed assets: `Cache-Control: public, max-age=31536000, immutable`
- `index.html`: `no-cache`

## Scaling notes

- The API is **stateless for REST** (JWT access tokens), so you can run multiple instances behind a load balancer.
- **Real-time collaboration across multiple instances needs Redis fan-out**, which is defined (`persistence/redisSync.ts`) but not yet connected — today, collaboration is effectively single-instance. See [Real-time Collaboration](realtime-collaboration.md) for the gap.
- **Sticky sessions** are advisable for WebSocket traffic until cross-instance sync is wired up.
