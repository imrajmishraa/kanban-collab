# Copilot instructions

The full agent guide is [`AGENTS.md`](../AGENTS.md); the constraints that have
already broken production are in [`docs/constraints.md`](../docs/constraints.md).
This file is the short version for inline suggestions.

## Shape of the codebase

- `server/` — Express 4 + TypeScript, **CommonJS** (`"module": "NodeNext"`, no
  `"type": "module"`). Layers: `interfaces/http` (routes, controllers,
  validators) → `application/` (use cases) → `infrastructure/` (db, cache, mail,
  logging, providers) → `shared/`. A controller must never call Mongoose.
- `client/` — Vite + React SPA, Tailwind v4, TanStack Query, zustand. Feature
  slices in `features/<x>/{api,components,hooks,stores}`.

## Write it this way

- **Validate with zod** in `interfaces/http/validators/`, applied through
  `validateSchema`. Never hand-roll checks in a controller.
- **Throw `ApiError`** from the factories in `shared/errors/<domain>.ts` with a
  `code` and `isOperational`. The client-facing message stays generic;
  diagnostics go in `data`. Provider error text never reaches a redirect URL.
- **Log with a pino child logger** (`authLogger`, `lifecycleLogger`, …) and
  structured fields. No `console.log`. Never log a token, a code or a cookie.
- **Lookups use `Object.hasOwn`**, never `key in object` — `in` also matches
  `constructor` and `__proto__`.
- **Tailwind v4 tokens**: `bg-(--bg-root)`, `text-(--text-secondary)`,
  `bg-(--brand)/4.5`. Bare numeric utilities (`z-100`, `w-2xl`) are valid v4.
  Do not rewrite them into v3 forms (`bg-[var(--bg-root)]`); `lint:colors`
  guards this.
- **A behaviour change ships with a test**, named after the rule it protects.
  Server tests in `server/tests/{unit,integration}`; client tests colocated as
  `*.test.tsx`.
- **Comments say why.** If you pass a comment that describes behaviour the code
  no longer has, fix the comment in the same change.

## Do not

- Add an ESM-only dependency (`docs/constraints.md` §1) or change
  `engines.node` to a `>=` range (§2).
- Edit a baseline file, a lockfile or a config to make a check pass.
- Introduce a second writer for a piece of state, or persist a measurement, an
  intermediate layout or a transient mode (hover, preview).
- Add a hard-coded number that already exists elsewhere — search the literal
  first.

## Before you call it done

`npm run check` in the package you touched, plus
`node scripts/check-change-budget.mjs`. Then say what you did **not** verify.
