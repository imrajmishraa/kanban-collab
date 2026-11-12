# AGENTS.md

Operational guide for AI coding agents working in this repository. Read this
before touching code. For architecture and API detail, read `docs/` — this file
does not repeat it, it records the constraints that are not obvious from the
tree and that have already caused production incidents.

## What this is

Kanban-Collab: a real-time collaborative task board.

- `server/` — Express 4 + TypeScript API. MongoDB (Mongoose), Redis, Yjs over
  `ws`, pino logging, zod validation, vitest.
- `client/` — Vite + React SPA. Tailwind v4, react-router, TanStack Query,
  Yjs client.
- Deployed: client as a **Render static site**, server on **Vercel**.

## Layout

```
server/src/
  application/     use cases (auth, dashboard, notifications, workspaces)
  bootstrap/       wiring, startup, shutdown
  config/          env schema (zod) — the single source of truth for config
  infrastructure/  db, cache, email, logging, scheduler, auth providers
  interfaces/      http (routes, controllers, validators), websockets
  serverless/      Vercel function entry (no cron, no signal handlers)
  shared/          errors, constants, types, utils
client/src/
  app/             providers, router
  features/<x>/    feature slice: api, components, hooks, stores
  components/      shared UI
  design/          tokens, theme
```

`server/src/main.ts` is the long-running entry (listens, runs cron, handles
signals). `server/api/index.ts` → `src/serverless/handler.ts` is the Vercel
function entry. They are **not** equivalent — see constraint 3.

## Commands

Run inside the package you changed, not at the repo root.

### server/

```bash
npm ci
npm run dev            # nodemon + ts-node, no build step
npm run typecheck      # tsc --noEmit
npm run lint
npm run test           # vitest run
npm run check          # typecheck + lint + format:check
npm run verify         # typecheck + lint + test
npm run build          # tsc -p tsconfig.build.json  → dist/
npm run start          # node dist/main.js (needs a prior build)
npm run infra:up       # mongo + redis via docker compose
```

### client/

```bash
npm ci
npm run dev
npm run typecheck      # tsc -b
npm run lint
npm run test           # vitest run
npm run check          # typecheck + lint + format + path lint + test
npm run build          # tsc -b && vite build
```

`client` has two custom linters wired into `check`: `lint:paths` (import path
rules) and `lint:colors` (theme colour tokens). A green `tsc` does not mean CI
will pass — run `npm run check`.

## Hard constraints

These are not style preferences. Each one has already broken production.

### 1. The server compiles to CommonJS — no ESM-only dependencies

`server/tsconfig.json` uses `"module": "NodeNext"`, and `server/package.json`
has **no** `"type": "module"`, so every source file is CommonJS and `tsc` emits
`require()` for imports.

An ESM-only package (`"type": "module"` with no `require` export condition)
therefore throws `ERR_REQUIRE_ESM` at module load, which kills the whole process
before any route answers — every endpoint returns 500, including `/healthz`.
This is how `@octokit/oauth-methods` and `@octokit/request` took the API down.

Before adding a dependency:

```bash
node -p "const p=require('<pkg>/package.json'); [p.type ?? 'commonjs', JSON.stringify(p.exports?.['.'] ?? null)]"
```

Reject it if `type` is `module` and the exports map has no `require` condition.
To prove a build is safe on a runtime without `require(esm)`:

```bash
node --no-experimental-require-module -e "require('./dist/<compiled file>.js')"
```

If a package is genuinely needed and ESM-only, use `fetch` against its HTTP API
instead of adding the dependency (this is what the GitHub provider now does).

### 2. `engines.node` must be a major range, never `>=`

`"node": "22.x"` — **not** `">=22.0.0"`. Vercel reads `engines.node` and ignores
the project setting, so a `>=` range silently pins the runtime to the newest
Node major and upgrades it again on every Node release. That is how the API
ended up running on a different Node version than the Docker image
(`node:22-bookworm-slim`), which is exactly the class of bug in constraint 1.

Same applies to `client/package.json`; `render.yaml` pins `NODE_VERSION` there.

### 3. The server has two deployment paths — know which one serves

`server/vercel.json` describes a serverless function (`api/index.ts`, rewrites,
crons). `server/Dockerfile` describes a long-running container that runs
`dist/main.js`. Vercel currently builds **both** on every deploy.

Consequences:

- The function has no `node-cron` and cannot hold long-lived WebSockets. The
  container can.
- Config that applies to one path is dead weight (or actively misleading) for
  the other. Changing `vercel.json` rewrites does nothing if the container is
  serving, and vice versa.

Before changing anything deployment-shaped, establish which path answers: the
container logs `Scheduled job completed` (cron); the function never does.

### 4. OAuth: the callback lives on the client origin, by design

`GOOGLE_REDIRECT_URI` / `GITHUB_REDIRECT_URI` point at the **client** origin
(`https://kanban-collab-client.onrender.com/api/v1/auth/oauth/<provider>/callback`),
and Render rewrites `/api/*` through to Vercel.

Do not "simplify" this by pointing the redirect URI at the API origin. The
refresh cookie is written for the client origin (`path: /api/v1/auth`), and the
browser only ever talks to that origin — moving the callback would set the
cookie on a host the app cannot read, producing a login that "succeeds" and
leaves the user signed out.

### 5. Cookies: `SameSite=None` requires `Secure`

`server/src/interfaces/http/utils/cookies.ts` sets `sameSite: "none"` in
production. A `SameSite=None` cookie without `Secure` is silently discarded by
Chrome, so `COOKIE_SECURE` must be true in every production environment. The
CSRF cookie and the refresh cookie share this flag deliberately — do not let
them diverge.

### 6. `google-auth-library`: `OAuth2Client.request()` needs credentials

`new OAuth2Client({ clientId, clientSecret, redirectUri }).request(...)` throws
`No access, refresh token, API key or refresh handler callback is set.` before
any HTTP request leaves the process. Profile reads use plain `fetch` with an
`Authorization: Bearer` header. Keep it that way; if you must use the client,
call `setCredentials({ access_token })` first.

### 7. OAuth state is signed, not stored

`state` is `<base64url(payload)>.<base64url(hmac)>` — self-contained, 15-minute
TTL, 60 s clock-skew tolerance (`src/application/auth/oauth/stateToken.ts`). It
carries the provider binding and the `rememberMe` flag.

The HMAC key is `OAUTH_STATE_SECRET`, falling back to `JWT_SECRET`. Set
`OAUTH_STATE_SECRET` explicitly in every environment: with the fallback, any
`JWT_SECRET` rotation invalidates in-flight logins, and two deployments behind
one hostname with different secrets reject every callback identically.

Rejections surface to the browser as `?status=error&reason=…`; the reason codes
distinguish missing params from a bad signature from expiry. Read the reason
before theorising about the provider — it is almost never the provider.

### 8. Tailwind v4, not v3

Theme values are CSS variables: `bg-(--bg-root)`, `text-(--text-secondary)`,
`bg-(--brand)/4.5`. Bare numeric utilities (`z-100`, `w-2xl`) are valid v4
dynamic utilities. Do not "fix" these into v3 forms (`bg-[var(--bg-root)]`,
`z-[100]`); `lint:colors` guards the token usage.

## Conventions

- **Layering**: controllers stay thin; use cases live in `application/`;
  provider/DB/cache details in `infrastructure/`. Do not call Mongoose from a
  controller.
- **Errors**: build them from the factories in `src/shared/errors/<domain>.ts`
  (`ApiError` with `code`, `isOperational`, optional `data`). Keep the client
  message generic and put diagnostics in `data` — provider error text must never
  reach a redirect URL.
- **Validation**: zod schemas in `interfaces/http/validators/`, applied through
  `validateSchema`. Parse, do not hand-roll checks in controllers.
- **Logging**: pino child loggers (`authLogger`, `lifecycleLogger`, …) with
  structured fields. Never `console.log`; never log tokens, codes or cookies.
- **Tests**: `server/tests/{unit,integration,load,shell_testing}`, client tests
  colocated as `*.test.tsx`. A behaviour change ships with a test.
- **Comments**: explain *why*, not *what*. If a comment states a constraint the
  code no longer honours (e.g. "no `prompt`" while passing `prompt`), fix the
  comment in the same change — stale comments have already cost hours here.

## Ask before doing

- Anything destructive against a real database (`drop`, `deleteMany` on
  non-test data).
- Changing an OAuth redirect URI, a cookie scope, or a signing secret.
- Switching the server between container and function deployment.
- Force-pushing, rewriting history, or touching `main` directly.

## Definition of done

1. `npm run check` passes in every package you touched.
2. `npm run build` succeeds for `server/` (it is what ships).
3. No new ESM-only dependency (constraint 1).
4. If you changed a documented behaviour, update the matching file in `docs/`.

## Known noise — do not chase these

Vercel build logs are noisy. These are expected and not actionable from this
repo:

- `Internal rewrites in backend framework projects now route requests using the
  rewritten destination path` — affects function selection; there is one
  function, so it is a no-op. Verify `/healthz`, `/ws`, `/api/v1/...` still
  answer.
- `npm warn Unknown env config "cache-dir"` — injected by the build environment,
  not by a `.npmrc` in this repo.
- `npm notice New major version of npm available` — npm's own advertisement.
- `HEALTHCHECK is not supported for OCI image format and will be ignored` — the
  Dockerfile's healthcheck does not run on Vercel; monitor `/healthz`
  externally instead.
- `npm warn deprecated node-domexception@1.0.0` — transitive:
  `google-auth-library` → `gaxios` → `node-fetch@3` → `fetch-blob`.
