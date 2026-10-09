# Contributing

Thanks for wanting to help. This guide covers how to set up, the workflow, and the conventions the codebase follows.

## 1. Set up

Follow [Local Development](local-development.md) to get the server and client running with hot reload. In short:

```bash
docker compose -f server/docker-compose.dev.yml up -d   # mongo + redis
cd server && npm install && cp .env.example .env        # set the 4 required vars
cd ../client && npm install && cp .env.example .env     # set VITE_WS_URL
```

## 2. Workflow

1. Branch off `main` (`feat/…`, `fix/…`, `docs/…`, `chore/…`).
2. Make your change with tests where it matters.
3. Run the checks locally (below) — CI runs the same ones.
4. Open a PR against `main` with a clear description of **what** and **why**.

Keep commits focused. Reference the issue/area you're touching in the PR description.

## 3. Code quality

Run these before pushing — CI enforces them (`--max-warnings 0`).

**Server:**

```bash
cd server
npm run check        # typecheck + lint + format:check
npm test             # unit + integration
```

**Client:**

```bash
cd client
npm run check        # typecheck + lint + format:check
npm test             # vitest
npm run check:unused # knip — dead-code scan (advisory)
```

| Tool | What it guards |
|---|---|
| `tsc --noEmit` / `tsc -b` | Types — strict, incl. `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` |
| ESLint | Style + correctness (`--max-warnings 0`) |
| Prettier | Formatting |
| Jest / Vitest | Tests |
| `knip` | Unused files/exports (client; advisory) |

> **`exactOptionalPropertyTypes` is on.** An optional property may be *absent* but must not be assigned `undefined`. Use conditional spreads (`...(x !== undefined ? { x } : {})`) when building objects with optional fields.

## 4. Tests

- **Server** — Jest, split into `tests/unit` and `tests/integration`. The integration suite covers the WebSocket/Yjs layer and mocks persistence/Redis. Add a unit test for pure logic and a validator test for new Zod schemas.
- **Client** — Vitest + Testing Library. Add a component/hook test for new interactive pieces.

The server validates its environment on import, so tests need the required env vars present (CI provides them; see `.github/workflows/ci-cd.yml`).

## 5. CI

`.github/workflows/ci-cd.yml` runs per-package (path-filtered) on every push/PR to `main`:

```
npm ci → typecheck → lint → format:check → test → build
```

On `main`, successful server/client jobs trigger the Render deploy hooks. `keep-alive.yml` self-pings the deployed service.

## 6. Conventions

These are the patterns the codebase follows — matching them keeps the code consistent.

**Layering (server).** Respect the layer boundaries: HTTP/WebSocket interfaces → application use-cases → infrastructure. Controllers orchestrate; they don't reach across into unrelated layers. Most business logic currently lives in controllers — that's the existing reality, but new complex flows can be extracted into `application/`.

**Errors.** Throw an `ApiError` (or a helper from `shared/errors/*`); never hand-roll error responses. The global `errorHandler` normalises and renders them. Use the specific error helpers (`boardNotFoundError()`, `guestCannotModifyBoardError()`, …) so codes stay consistent.

**Responses.** Return `new ApiResponse(status, message, data)`. Every success is `{ statusCode, success, message, data }`.

**Async handlers.** Wrap controllers in `asyncHandler` so rejections reach the error middleware.

**Validation.** Every route declares a Zod schema and applies it with `validateSchema`. Add schemas in `interfaces/http/validators/**`. Note: `validateSchema` places results on `req.validated` — prefer reading that over `req.body` in new controllers.

**Naming & files.** One concern per file; co-locate tests; follow the existing folder structure (`controllers/`, `validators/`, `application/`, …).

**Client.** Feature-slice under `features/`; server state via TanStack Query; client state via Zustand; Zod validations mirror the server. Keep the collaboration primitives (`collaboration/`) self-contained.

## 7. Documentation

This `docs/` folder is part of the repo. If you change behaviour, update the relevant doc:

| Change | Update |
|---|---|
| New/changed endpoint | `docs/api-reference.md` |
| Schema/collection change | `docs/data-model.md` |
| Auth/session/cookie change | `docs/auth-security.md` |
| Collaboration change | `docs/realtime-collaboration.md` |
| Infra/deploy change | `docs/deployment.md` |

Diagrams use [Mermaid](https://mermaid.js.org/) (renders on GitHub). Keep docs describing the code as it actually is — if code and docs disagree, that's a bug.

## 8. PR checklist

- [ ] `npm run check` passes in the package(s) you touched
- [ ] Tests added/updated and passing
- [ ] No new lint warnings (`--max-warnings 0`)
- [ ] Docs updated if behaviour changed
- [ ] Commit message describes the change
