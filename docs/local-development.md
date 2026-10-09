# Local Development

This guide runs Mongo and Redis in containers but the **server and client on your host**, so you get hot reload on both. If you just want to run the whole thing, use [Getting Started](getting-started.md).

## Prerequisites

- **Node.js ≥ 22** and **npm ≥ 10** (both packages declare this in `engines`).
- **Docker** (for Mongo + Redis). If you already have MongoDB and Redis running locally, you can skip the containers and point the env vars at them.

## 1. Start the infrastructure

```bash
docker compose -f server/docker-compose.dev.yml up -d
```

This brings up **Mongo on `localhost:27017`** and **Redis on `localhost:6379`** only — nothing else.

## 2. Server

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`. The server **validates its environment at boot** (`src/config/env.ts`) and exits if anything required is missing. Four variables have **no default** and must be set:

| Variable | Notes |
|---|---|
| `MONGODB_URI` | e.g. `mongodb://localhost:27017/kanban-collab` |
| `REDIS_URL` | e.g. `redis://localhost:6379` |
| `JWT_SECRET` | ≥ 32 chars |
| `JWT_REFRESH_SECRET` | ≥ 32 chars, must differ from `JWT_SECRET` |

For local dev, the defaults for everything else are fine (`PORT=3000`, `CLIENT_URL=http://localhost:5173`, `CORS_ORIGINS=http://localhost:5173,http://localhost:3000`, `EMAIL_PROVIDER=console`, etc.). The full list — and the cross-field rules (OAuth all-or-nothing, SMTP requires host+user, …) — is documented in the comments at the bottom of `.env.example`.

Start the dev server:

```bash
npm run dev          # nodemon + ts-node, restarts on change
# or: npm run dev:pretty   (piped through pino-pretty)
```

The API is now on **http://localhost:3000**. Verify:

```bash
curl -s http://localhost:3000/healthz | jq .
```

## 3. Client

```bash
cd ../client
npm install
cp .env.example .env
```

Set the WebSocket URL for local dev in `client/.env`:

```bash
VITE_WS_URL=ws://localhost:3000/ws
```

> Note: the sample file's default points at production. For local development you must override it, or the browser will try to open a cross-origin production socket. (The sample also contains a typo — `ws//` — use `ws://`.)

Start Vite:

```bash
npm run dev          # http://localhost:5173
```

The Vite dev server **proxies `/api` and `/ws` to `http://localhost:3000`** (see `client/vite.config.ts`), so REST and WebSocket traffic reach the API without CORS gymnastics. Open **http://localhost:5173**.

## Ports at a glance

| What | Port |
|---|---|
| API (server) | 3000 |
| Client (Vite dev) | 5173 |
| Mongo | 27017 |
| Redis | 6379 |
| Full Compose stack — web | 8080 |

`PORT` is **3000** everywhere (dev server, Vite proxy, nginx upstream, health scripts) so nothing drifts.

## Scripts

**Server** (`server/package.json`):

| Script | Does |
|---|---|
| `npm run dev` | Dev server with reload |
| `npm run build` / `start` | Compile (`tsc`) / run `dist` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` / `lint:fix` | ESLint (`--max-warnings 0`) |
| `npm run format` / `format:check` | Prettier |
| `npm run check` | typecheck + lint + format:check |
| `npm test` / `test:unit` / `test:integration` | Jest |
| `npm run test:coverage` | Jest with coverage |

**Client** (`client/package.json`):

| Script | Does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` / `preview` | Production build / preview it |
| `npm run typecheck` | `tsc -b` |
| `npm run lint` / `format` | ESLint / Prettier |
| `npm run test` | Vitest |
| `npm run check:unused` | `knip` — dead-code scan (advisory) |

## Running tests

```bash
cd server && npm test          # unit + integration
cd server && npm run test:unit
cd server && npm run test:integration
```

The integration suite exercises the WebSocket/Yjs layer. It mocks persistence and Redis, so it does not need live services — but the server's env is validated on import, so the required variables above must be present in the test environment (CI supplies them; see `.github/workflows/ci-cd.yml`).

## Troubleshooting

- **Server exits immediately** — a required env var is missing/invalid. The log prints each offending field and its message before exiting. Re-check `.env` against the table above.
- **`readyz` is 503** — Mongo or Redis isn't reachable. Confirm `docker compose -f server/docker-compose.dev.yml ps` shows both healthy.
- **WebSocket won't connect** — check `VITE_WS_URL` in `client/.env` points at `ws://localhost:3000/ws`, and that the server is running.
- **CORS errors** — make sure `CLIENT_URL`/`CORS_ORIGINS` in `server/.env` include `http://localhost:5173`.

## Next

- Understand the design → [Architecture](architecture.md)
- Understand the collaboration layer → [Real-time Collaboration](realtime-collaboration.md)
