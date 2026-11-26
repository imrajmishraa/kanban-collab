# CLAUDE.md

This repository's agent guide is [`AGENTS.md`](AGENTS.md). Read that file, not
this one — this exists only because Claude Code loads `CLAUDE.md` and not
`AGENTS.md`, and every agent should start in the same place.

Read in this order:

1. [`docs/constraints.md`](docs/constraints.md) — what has already broken
   production: the CommonJS server and the ESM trap, `engines.node`, the two
   deployment paths, the OAuth callback origin, `SameSite=None`, the signed
   state, Tailwind v4. Plus the per-package commands and the gates.
2. [`docs/change-rules.md`](docs/change-rules.md) — how big a change may be, and
   the gates that fail the build.
3. [`AGENTS.md`](AGENTS.md) — how to get from "something is wrong" to "it is
   fixed, and here is the proof".
4. [`DESIGN.md`](DESIGN.md) — before touching the shell (rail, board, column).

Three things cost a deploy when guessed wrong, so they are repeated here:

- **No ESM-only dependency.** The server compiles to CommonJS; an ESM-only
  package throws `ERR_REQUIRE_ESM` at load and every endpoint 500s, `/healthz`
  included (`docs/constraints.md` §1).
- **`engines.node` stays a major range** (`"26.x"`), never `>=` (§2).
- **Never push to `main`.** Branch, commit, open a PR — the change-budget gate
  runs on pull requests only.
