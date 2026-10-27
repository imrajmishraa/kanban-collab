# Deployment

There are two supported ways to run Kanban-Collab: **Docker Compose** (self-hosted, everything in one stack) and a **managed split** — the static client on **Render** (the blueprint in `render.yaml`) and the API on **Vercel** as a serverless function. Both paths run the same client and server code.

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

## Option B — Managed split: Render (client) + Vercel (API)

The web tier is defined in `render.yaml`. The API is a separate **Vercel** project whose Root Directory is `server`.

### The client — Render static service

**`kanban-collab-client`** (`rootDir: client`) runs `npm ci && npm run build` and publishes `dist/`. It rewrites `/api/*` to the Vercel API (server-side, so the browser stays on one origin — CORS and first-party cookies behave as behind nginx) and falls back to `/index.html` for the SPA. It also sets security headers and long-lived asset caching.

Automatic deploys are **off** (`autoDeployTrigger: 'off'` in `render.yaml`), so the service deploys only when CI fires its deploy hook. If the service was created by hand in the dashboard rather than from the Blueprint, the Blueprint cannot change it — set Auto-Deploy to No under Service → Settings → Build & Deploy instead.

> The `/api/*` rewrite in `render.yaml` must come **before** the SPA catch-all, or the catch-all swallows API calls. This is already ordered correctly in the blueprint.

### The API — Vercel serverless

Vercel does not run a listening process, so the API is exposed through a function entry:

| Path | Role |
|---|---|
| `server/api/index.ts` | Function entry. Two lines: imports the server and default-exports it. Vercel matches this file to `/api`. |
| `server/src/serverless/handler.ts` | Builds the `http.Server` at module load, attaches Express and the WebSocket server, connects infrastructure lazily, and owns the `upgrade` listener. No `listen()`, no cron, no signal handlers — the platform owns instance lifetime. |
| `server/src/bootstrap/infrastructure.ts` | Memoized `ensureInfrastructure()` — one Mongo/Redis connection attempt per instance, shared with `main.ts`. A failed attempt is cleared so the next request retries. |
| `server/vercel.json` | Rewrites every route the app serves to the function, sets `maxDuration`, declares the daily cron. |

`vercel.json` rewrites `/api/v1/*`, `/healthz`, `/readyz`, `/websocket`, `/ws` and `/` to `/api`. Rewrites preserve the original `req.url`, so Express routes on the real path. Do **not** replace the entry with an `api/[...path].ts` catch-all — that pattern 404s on multi-segment paths.

Required project settings:

| Setting | Value |
|---|---|
| Root Directory | `server` |
| Node.js Version | 22.x (matches CI, both Dockerfiles and `render.yaml`) |
| Skip deployments when there are no changes to the root directory | **Enabled** — this is what stops client-only pushes rebuilding the API |
| Ignored Build Step | **Automatic** (leave a custom command empty; a command exiting `0` skips every build) |

Environment variables live in the Vercel project, not this repo. Beyond the standard set in [Environment](#environment), serverless needs `CRON_SECRET` (see [Background jobs](#background-jobs)) and should set `SCHEDULER_ENABLED=false`.

### CI/CD

`.github/workflows/ci-cd.yml` detects which side changed and, after that side's checks pass, calls the matching deploy hook:

| Changed paths | Deploy hook | Target |
|---|---|---|
| `client/**` or `render.yaml` | `RENDER_DEPLOY_HOOK_WEB` | Render static client |
| `server/**` | `VERCEL_DEPLOY_HOOK_SERVER` | Vercel API |
| docs, README, anything else | none | no deploy |

Workflow and compose-file changes run the checks but deploy nothing. `keep-alive.yml` pings the client and the API `/healthz` every 12 minutes.

## Environment

The server validates its environment at load (`server/src/config/env.ts`) and **exits 1** on a missing/invalid required variable — in Docker that fails the container, and on Vercel it fails the function invocation. Set these variables in the Vercel project for the API and in `render.yaml` for the client. Only four variables have **no default**: `MONGODB_URI`, `REDIS_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`. `.env.example` documents every variable and the cross-field rules.

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
npm run build        # tsc -p tsconfig.build.json → dist/  (prebuild runs typecheck)
npm start            # node dist/main.js
```

Two tsconfigs, deliberately:

| Config | Used by | `rootDir` | Includes |
|---|---|---|---|
| `tsconfig.json` | `tsc --noEmit`, ESLint, the editor, Vercel's function compile | `.` | `src/**`, `api/**` |
| `tsconfig.build.json` | `npm run build` | `./src` | `src/**` only |

`rootDir` must be explicit (TypeScript 6 requires it), and it must be `./src` for the build so `dist/main.js` lands where `npm start` and the Dockerfile expect. Pointing the shared config at `.` lets `api/index.ts` sit inside the type-checked program without moving the build output.

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

Jobs are declared once in `server/src/infrastructure/scheduler/cron.ts` and can be triggered two ways:

1. **In-process** (`node-cron`) when the service runs as a long-lived process — Docker Compose, Render. Controlled by `SCHEDULER_ENABLED`; started after the server listens.
2. **Over HTTP** — `GET /api/v1/internal/cron/:job` with `Authorization: Bearer $CRON_SECRET`. This is how serverless runs them, since no process outlives a request. The route fails closed: with no `CRON_SECRET` set it answers `503` and runs nothing.

| Job | Env | Default |
|---|---|---|
| Notification digest | `NOTIF_DIGEST_CRON` | `0 8 * * *` |
| Due-date reminders | `NOTIF_DUE_REMINDER_CRON` | `*/15 * * * *` |
| Workspace deletion (hard delete of scheduled workspaces) | `WORKSPACE_CLEANUP_CRON` | `0 * * * *` |
| Self-ping (keep-alive) | `SELF_PING_CRON` | `*/10 * * * *` |
| Yjs snapshot | `YJS_SNAPSHOT_INTERVAL_MS` | every 5 min |

Jobs guard against overlapping runs when scheduled in-process.

**On Vercel, schedule constraints apply.** Hobby plans run cron jobs **once per day only** — a more frequent expression fails the deployment — and fire them anywhere within the specified hour. So `vercel.json` declares just the daily digest. The sub-daily jobs need either a GitHub Actions schedule calling the endpoint with the secret, or a Pro plan (per-minute scheduling).

Two jobs are **instance-bound and should not be scheduled against Vercel**: `yjs-snapshot` (in-memory documents live only on the instance holding the connection, so a cron landing elsewhere finds nothing — persistence is already handled by the debounced writer) and `self-ping` (it exists to keep a Render instance warm).

## Keep-alive

On a free Render instance the service can spin down after inactivity. `.github/workflows/keep-alive.yml` pings the client URL and the API's `/healthz` every 12 minutes, with per-request timeouts and retries, and reports a non-2xx response as a warning rather than failing the run.

The in-process `self-ping` job (`SELF_PING_URL`, falling back to `RENDER_EXTERNAL_URL`) is the long-lived-host equivalent and is pointless on Vercel. Leave both blank locally.

Two caveats on relying on GitHub's scheduler: runs are frequently delayed 5–20 minutes under load, and scheduled workflows are disabled automatically after 60 days without repository activity. If the client must never sleep, an external pinger is more dependable.

## Security headers & caching

Both nginx (`client/nginx.conf.template`) and `render.yaml` set:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=()`
- Hashed assets: `Cache-Control: public, max-age=31536000, immutable`
- `index.html`: `no-cache`

## Scaling notes

- The API is **stateless for REST** (JWT access tokens), so multiple instances can serve traffic.
- **Real-time collaboration fans out across instances over Redis pub/sub.** `persistence/redisSync.ts` is bound to each document in `documentManager`, and its pub/sub clients connect during `initializeCollaboration`, so an update published by one instance reaches subscribers on another. See [Real-time Collaboration](realtime-collaboration.md).
- **WebSocket connections are duration-capped on serverless.** Vercel closes a connection when the function reaches `maxDuration` — 300 s on Hobby. The client (`client/src/collaboration/YjsProvider.ts`) reconnects with exponential backoff and re-sends sync step 1 plus full awareness, so state resyncs after each drop. Expect a visible reconnect roughly every five minutes per open board.
- **Cold starts** reconnect Mongo and Redis once per instance, memoized by `ensureInfrastructure()`. Keep `MONGO_MAX_POOL_SIZE` modest for serverless.
- On a long-lived host, **sticky sessions** remain advisable for WebSocket traffic.
