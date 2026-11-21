# Splitting deploys — what is possible, what it costs

Written after the third wave of work, when every push rebuilt the whole side and
the question came up: can a change redeploy only the part it touched, leaving the
rest serving?

Short answer: **partly, and the part that is possible is not the part people
expect.** Vercel builds a *project*; it cannot deploy one function of a project.
So the unit of independent deployment is a project, not a function.

## What is already true

- **No downtime today.** Vercel and Render both deploy atomically: the running
  deployment keeps serving until the new one is healthy. The old deployment is
  only removed after the switch.
- **A client-only change does not redeploy the API.** `ci-cd.yml` gates
  `deploy-server` on `server/**` and `deploy-client` on `client/**` (or
  `render.yaml`). This has been true since the CI gate landed.

So "the server is down while we deploy" is not a problem to solve. The real costs
are **build time** (~40–60 s for the API, ~2 min for the client) and **blast
radius** (one function serves every route).

## The constraint that decides the shape

`server/src/serverless/handler.ts` keeps **Yjs documents in process memory**,
keyed by board, with Redis pub/sub as the cross-instance bridge. Two things
follow:

1. The WebSocket upgrade and the CRUD routes must not end up in different
   deployments of the same logical service — a redeploy of the socket path while
   boards are open drops every live document.
2. Splitting the Express app into several *functions* does not shrink anything
   unless each function imports a subset of the routers, and the moment the
   socket lives in its own function, the two instances no longer share the
   document registry by construction.

That is why "one function per feature" is the wrong axis here. The axis is
**runtime shape**: stateless HTTP, and a stateful realtime path.

## Options, in increasing cost

### 1. Skip builds that ship nothing (implemented)

`ignoreCommand` in `server/vercel.json`:

```
git diff --quiet HEAD^ HEAD -- src api package.json package-lock.json \
  tsconfig.build.json vercel.json
```

Exit 0 skips the build. A push that touches only `server/.env.example`, a README
or a test fixture no longer produces a deployment. Cheap, reversible, no
behaviour change.

### 2. Make the build cheaper (safe, worth measuring)

The build runs `npm ci --include=dev`, then `prebuild` → `tsc --noEmit`, then
`tsc -p tsconfig.build.json`. The last two exist to typecheck — which **CI
already does on every PR**. The Vercel Function bundles from `api/index.ts`
directly, so `dist/` is not what gets served.

Dropping the build step should take the deploy from ~40 s to ~15 s. It is not
done yet because the "Other" preset needs an output directory, and that
combination cost two failed deploys last week. Try it on a branch, watch the
first deploy, keep it only if the log is clean.

### 3. Two Vercel projects — the only way to truly deploy one side

| Project | Root | Serves | `maxDuration` |
|---|---|---|---|
| `kanban-collab-server` | `server/` | everything except the socket | 60 |
| `kanban-collab-realtime` | `server/realtime/` | `/ws`, `/websocket`, cron | 300 |

`server/realtime/api/index.ts` re-exports the same handler; its own
`vercel.json` carries the rewrites for the socket paths only. The client points
`VITE_WS_URL` at the realtime project.

Then a change under `src/interfaces/websockets/**` redeploys only realtime, and a
change under `src/interfaces/http/**` only the API — which is the thing that was
actually asked for.

Costs, honestly:

- a second project, a second environment-variable set (every secret twice, and
  they must not drift)
- `maxDuration: 60` for the API means a slow request dies at a minute — fine for
  CRUD, and it is what makes cold starts cheaper
- two deploy hooks and two CI filters to keep in sync
- a cross-cutting change (a shared controller, a schema edit) still needs both
- the client's `VITE_WS_URL` becomes a deploy-order dependency: realtime first,
  then the client

Recommendation: do 1 and 2 now; take 3 only if build time keeps hurting after
that, because it buys minutes per week and costs a second thing to keep healthy.

### 4. Not recommended: one project per feature domain

`boards`, `cards`, `comments`, `notifications` as separate projects means:

- five environment-variable sets and five deploy hooks
- what is currently an in-process call (read board → check membership → read
  cards) becomes an HTTP hop with its own timeouts, retries and failure modes
- five cold-start surfaces instead of one
- the collab path cannot be split this way at all (see the constraint above)

For a project of this size the operational surface is worth more than the build
seconds.

## Frontend

- The app is one Vite bundle. Routes are already lazy (`app/routes/pages.ts`), so
  a change invalidates a chunk, not the whole graph.
- **Marketing and docs can move out** into their own static project — different
  change cadence, and prerendering for SEO is easier there. That is a real split.
- **The dashboard cannot move away from the app.** It is the app, and it shares
  the board's Yjs document; a separate origin would need its own socket and its
  own auth handshake for no gain.

## What not to build

"Make the changed function unavailable while it deploys." Atomic deploys exist
precisely so that never happens; adding a maintenance window would trade a
guarantee for a habit.

## Appendix — setting up the realtime project, if you take option 3

Two projects cannot share a root directory and read different `vercel.json`
files, so the realtime project gets its own root.

1. Create `server/realtime/api/index.ts`:

   ```ts
   /* The same handler the API project uses: the socket needs the Express app to
      route the upgrade, and the cron route needs the app to reach it. */
   export { default } from "../../api/index";
   ```

2. Create `server/realtime/vercel.json`:

   ```json
   {
     "$schema": "https://openapi.vercel.sh/vercel.json",
     "framework": null,
     "installCommand": "cd .. && npm ci --include=dev",
     "buildCommand": "cd .. && npm run build",
     "outputDirectory": "../dist",
     "rewrites": [
       { "source": "/ws", "destination": "/api" },
       { "source": "/websocket", "destination": "/api" },
       { "source": "/api/v1/internal/cron/(.*)", "destination": "/api" }
     ],
     "functions": { "api/index.ts": { "maxDuration": 300 } }
   }
   ```

3. In the Vercel dashboard for the new project: Root Directory `server/realtime`,
   **Include files outside the root directory** ON (the `cd ..` install needs it),
   Node 26.x, and the same environment variables as the API project.

4. Remove `/ws` and `/websocket` from `server/vercel.json`, drop the cron entry
   there, and point the client at the new host:

   ```yaml
   # render.yaml
   - key: VITE_WS_URL
     value: wss://kanban-collab-realtime.vercel.app/ws
   ```

5. CI: split the deploy filter.

   ```yaml
   server_app:
     - 'server/**'
     - '!server/src/interfaces/websockets/**'
     - '!server/realtime/**'
   realtime_app:
     - 'server/src/interfaces/websockets/**'
     - 'server/realtime/**'
   ```

   Deploy realtime **before** the client, so `VITE_WS_URL` is never pointing at a
   host that does not answer yet.

Nothing here is built yet: it is a checklist to run when option 3 is worth it,
not a record of what exists.
