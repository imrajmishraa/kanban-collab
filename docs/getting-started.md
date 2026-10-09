# Getting Started

This guide runs the **entire stack** — database, cache, API and web client — with Docker Compose, then walks you through a first board. It takes about ten minutes.

If you'd rather run the server and client on your host with hot reload, use [Local Development](local-development.md) instead.

## Prerequisites

- **Docker** and **Docker Compose** (v2, i.e. the `docker compose` subcommand).
- That's it for the quickstart. (For local dev without Docker you'll also need Node.js ≥ 22 — see [Local Development](local-development.md).)

## 1. Clone and configure

```bash
git clone https://github.com/imrajmishraa/kanban-collab.git
cd kanban-collab
```

The Compose stack reads `server/.env`. Create it from the sample and set the two secrets the server refuses to boot without:

```bash
cp server/.env.example server/.env
```

At minimum, set strong values for `JWT_SECRET` and `JWT_REFRESH_SECRET` (each ≥ 32 characters). You can generate a pair with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Run it twice and paste the two values in. Everything else in `.env.example` has a sensible default — the sample file documents every variable and the cross-field rules the server enforces at boot. In the Compose stack, Mongo and Redis are provided as containers, so you don't need `MONGODB_URI`/`REDIS_URL` values (Compose overrides them to the in-network hosts).

## 2. Bring up the stack

```bash
docker compose up -d --build
docker compose logs -f
```

This starts four services:

| Service | What it is | Host port |
|---|---|---|
| `web` | nginx serving the built SPA, proxying `/api` and `/ws` to `api` | **http://localhost:8080** |
| `api` | Node/Yjs backend (REST + WebSocket) | http://localhost:3000 |
| `mongo` | MongoDB 7 | (internal) |
| `cache` | Redis 7 | (internal) |

Wait for the `api` container to report healthy, then open **http://localhost:8080**.

## 3. Take it for a spin

1. **Register** an account (email + password), or sign in with Google/GitHub if you configured OAuth.
2. **Create a workspace** — the container that holds boards and members.
3. **Create a board** inside it.
4. **Add a column**, then **add a card** to it.
5. **Open a second browser window** (or an incognito window) signed in as a second user in the same workspace, open the same board, and edit a card — you should see the change appear in the other window in real time.

To add a second user: open the workspace's **Members** page and invite an email, or create a second account and add it to the workspace.

## 4. Confirm it's healthy

```bash
curl -s http://localhost:3000/healthz | jq .   # liveness — 200 while the process is up
curl -s http://localhost:3000/readyz  | jq .   # readiness — checks Mongo + Redis
```

`/readyz` returns `503` if a dependency is unreachable. See [Deployment](deployment.md) for the full probe semantics.

## 5. Shut it down

```bash
docker compose down        # keep data volumes
docker compose down -v     # also drop Mongo/Redis/uploads volumes
```

## Next steps

- **Want to develop?** → [Local Development](local-development.md)
- **Want to understand the design?** → [Architecture](architecture.md)
- **Integrating with the API?** → [API Reference](api-reference.md)
