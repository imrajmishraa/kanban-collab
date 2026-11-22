# Change rules

Every change in this repository is **bounded**: a known maximum size, a known set
of files it may touch, and a set of checks that fail when it crosses a line. Not
because small changes are always better, but because a change you cannot review
is a change you cannot trust — and this repo is worked on by several agents and
one human in parallel.

Three of these rules are already enforced by scripts that run in CI. The rest are
review rules, marked **[review]** — they are the ones a human or an agent has to
hold, because no grep can judge them.

Read this with `AGENTS.md`: that file records constraints that have already
broken production (ESM dependencies, cookie scope, deployment paths). This file
records what a change may *look like*.

---

## 1. The gates

| Gate | Command | Budget | Catches |
|---|---|---|---|
| Change size | `node scripts/check-change-budget.mjs --strict` | 15 files · 600 added lines · 2 areas | PRs too large to review or revert |
| Format | `npm run format:check` (both packages, incl. `scripts/**`) | — | unformatted code, including the rule scripts themselves |
| Client structure | `client/npm run lint:paths -- --strict` | — | files in the wrong place, imports crossing a feature boundary |
| Client surfaces | `client/npm run lint:surface -- --strict` | `.tsx` 400 · `.ts` 300 lines | hover-only controls, `100vh`, missing safe-area, drag-only, oversized components |
| Server structure | `server/npm run lint:layers -- --strict` | controller 400 · websocket 500 · use case 400 · shared 300 lines | upward imports, `console`, `process.env` outside `config/env.ts`, raw `ApiError` in controllers |
| Tokens | `client/npm run lint:colors -- --strict` | — | colours that bypass the design tokens |

`npm run check` in each package runs the relevant ones. CI runs them again; a
green `tsc` does not mean the PR passes.

### The baseline files

`client/scripts/surface-baseline.json`, `client/scripts/theme-colors-baseline.json`
and `server/scripts/layers-baseline.json` are **debt ledgers**. Each entry is a
finding that exists today and is tolerated; anything not in the ledger fails the
build. `lint:colors` had been written but never wired in, so twenty raw colours
had accumulated in the docs and marketing surfaces — recording them is what let
the gate be switched on at all.

`format:check` covers `scripts/**` in both packages. It did not, which is how a
misformatted rule script reached a pull request while every check was green.

- The ledger only shrinks. Fixing a finding means deleting its entry in the same
  PR.
- Adding an entry is a decision, not a shortcut: it needs a line in the PR
  description saying why the file cannot be split or fixed now.
- **Never edit a baseline to make a new change pass.** If a new finding appears,
  the change is what is wrong. This is the one rule that voids every other rule,
  and it is the first thing to check in review.

---

## 2. Change classes

Pick the class before writing code. It decides the budget, the files, and what
the PR has to carry.

| Class | Size | May touch | Must carry |
|---|---|---|---|
| **A — local fix** | ≤ 3 files, ≤ 120 lines | one feature folder, or one file + its test | a test if behaviour changed |
| **B — feature slice** | ≤ 15 files, ≤ 600 lines | one `client/src/features/<x>/` or one `server/src/application/<x>/` plus its interface layer | tests, and a `docs/` update if a documented behaviour moved |
| **C — cross-cutting** | over the above, or both `server/` and `client/` app code | anything | a design note under `docs/`, and a `Change-Budget-Exception:` trailer saying why it cannot be split |

A class-C change that does not fit in one review is split into a **stack**: the
first PR adds the seam (a flag, an unused module, a widened type) and changes no
behaviour; the second uses it. A stack is honest. A 900-line "misc" PR is not.

Rules that apply to every class:

- **One concern.** A rename sweep and a behaviour change never share a commit.
- **No drive-by formatting.** `prettier --write` on a file you did not otherwise
  change turns a 5-line diff into a 300-line one.
- **Deleting is free.** Removal never counts against the budget — the counter is
  *added* lines, not touched ones.
- **No new dependency** without checking `AGENTS.md` §1 (the server compiles to
  CommonJS; an ESM-only package takes the API down at load).

---

## 3. File and component budgets

Measured on today's tree: client `.tsx` median 80 lines, p90 342, p95 461; server
p50 78, p90 228. The budgets sit just above p95 so they catch the outliers that
already hurt, not the ordinary file.

| Thing | Budget | When you cross it |
|---|---|---|
| React component (`.tsx`) | 400 | extract the repeated block as a component, the state as a hook |
| Hook / util / store (`.ts`) | 300 | split by responsibility, not by line count |
| Server controller | 400 | the handler is several handlers — one file per resource action group |
| Server use case (`application/`) | 400 | the use case is orchestration plus policy; move the policy to a pure function (see `linkDecision.ts`, `sessionMachine.ts`) |
| Shared util | 300 | it is probably two utils |

Exempt: tests, `navConfig`-style data tables, and the Mongoose schema registry —
a list is not logic.

### Component rules

1. **One component per file**, exported by name. `check-paths.mjs` enforces it;
   `multi` is a hard finding.
2. **Presentational components do not fetch.** Data comes in as props or through
   a hook in `hooks/`. A `useQuery` inside a component that renders markup is the
   reason the board view is 568 lines.
3. **≤ 8 props.** Past that, the component wants a `variant`/`slot` split, not
   more booleans.
4. **A feature's `index.ts` is its public API.** Everything else in the folder is
   private; another area imports the barrel or nothing.
5. **Tests sit next to the thing they test** (`*.test.tsx` colocated). A test file
   in a shared folder is usually a sign the code is in the wrong place.

---

## 4. Import rules

### Client

Dependencies point **downward** in this list. An import may reach the same row or
below, never above. `check-paths.mjs` enforces the feature boundary; the rest is
review.

| Layer | May import | Must not import |
|---|---|---|
| `app/`, `layouts/` | anything | — |
| `pages/` | features, components, hooks, lib, stores | another page |
| `features/<x>/` | `components/`, `hooks/`, `lib/`, `services/`, `stores/`, `types/`, `design/`, itself | another feature's internals (barrel only), `pages/`, `app/` |
| `components/` | `lib/`, `hooks/`, `design/`, `types/`, `stores/`, a feature's **barrel** | a feature's internals, any `pages/` |
| `hooks/`, `stores/` | `lib/`, `services/`, `types/` | components, pages, features |
| `lib/`, `services/` | `types/` | React, components, features |
| `design/` | nothing | everything |
| `types/`, `validations/` | nothing (types only) | runtime code |

Additional:

- **No deep cross-feature imports.** `@/features/boards/components/BoardView` from
  anywhere outside `features/boards` is a `boundary` finding.
- **A shared bucket is for what two or more areas genuinely need.** One consumer
  means it belongs to that consumer.
- **Path aliases only from the configured list** (`@/`, `@components/`,
  `@hooks/`, `@validations/`, `@app/`, `@api/`). A `../../../` chain is a finding
  waiting to happen.
- **No `import * as`** for a module you use one function from — it defeats
  tree-shaking and hides the dependency.

### Server

Layer order, lowest first — imports point down:

```
shared/  →  config/  →  infrastructure/  →  application/  →  interfaces/
```

- `shared/` may import nothing but `shared/` and packages.
- `interfaces/` (controllers, routes, websockets) is the only layer that may
  import `application/`.
- Nothing imports `interfaces/` except `bootstrap/`, `main.ts`, and the
  serverless handler.
- **Controllers stay thin**: validate, authorize, call, respond. A Mongoose model
  call in a controller is a use case that was never extracted (this is debt the
  code already carries — do not add more).
- `process.env` only in `config/env.ts`. Everything else imports `ENV`.
- Errors come from the factories in `shared/errors/<domain>.ts`, never
  `new ApiError(...)` in a handler.

---

## 5. Surface rules

Three surfaces, defined by the Tailwind v4 defaults the repo already uses:

| Surface | Width | The question |
|---|---|---|
| **mobile** | `< 640px` | does it work with one thumb, no hover, and a bar of browser chrome? |
| **tablet / middle** | `640–1023px` (`sm:` … `md:`) | does it work when it is neither stacked nor wide? |
| **desktop** | `≥ 1024px` (`lg:` and up) | does it work with a keyboard, and at 200% zoom? |

A change is not done until it has been looked at on all three. Budget five
minutes for the middle one — it is the surface nobody opens, and the one this
repo has already shipped broken.

### Mobile (`< 640px`) — mandatory

1. **Touch target ≥ 44×44px.** `h-11` / `size-11` is the floor; `h-8` (32px) is a
   miss-tap. Reported by `surface/touch-target`.
2. **No hover-only affordance.** A control revealed by `group-hover:` must also
   appear on `group-focus-within:` (or be always visible on touch). Enforced as
   `surface/hover-only`.
3. **`dvh`, not `vh`.** `h-screen` and `100vh` are wrong on iOS, where the browser
   chrome is inside the viewport. Enforced as `surface/vh-not-dvh`.
4. **Fixed chrome respects the safe area** — `padding-bottom: env(safe-area-inset-bottom)`
   on anything pinned to the bottom, `viewport-fit=cover` in the document head.
   Enforced as `surface/safe-area`.
5. **Every core action has a tap or keyboard path.** HTML5 drag-and-drop fires
   from no finger: a card that can only be reordered by dragging cannot be
   reordered on a phone. A "move to column" action is required alongside the drag.
   Enforced as `surface/drag-only`.
6. **No horizontal scroll.** A wide table or a `w-[720px]` child is a bug, not a
   layout choice.
7. **Text at 16px minimum for inputs** — anything smaller makes iOS zoom on focus.

### Tablet / middle (`640–1023px`) — mandatory

1. **Declare every step you need.** If a layout changes shape at `lg:`, decide
   what it is at `md:`. `grid grid-cols-1 lg:grid-cols-4` with nothing between is
   the shape that squeezes; report-only check `surface/no-middle`.
2. **Two columns is the default middle answer** for card grids and split views —
   not one, not four.
3. **No layout that assumes a mouse and a wide window at the same time**: side
   panels that only collapse at `lg:` are open at 768px, where they eat the
   content.
4. **Touch rules still apply.** A tablet has no hover, and a 1024px iPad is a
   tablet.

### Desktop (`≥ 1024px`) — mandatory

1. **Hover reveals must have a focus equivalent.** Anything on `hover:` also
   needs `focus-visible:` — the same information, not a tooltip that vanishes.
2. **Pointer-only handlers need a keyboard path.** `onMouseEnter` with no
   `onFocus` is a menu keyboard users cannot open.
3. **No layout that only works at one width.** Check 1280 and 1536; the repo has
   `max-w-295`-style caps for a reason.
4. **Zoom to 200% and look again** — this is the cheapest accessibility test there
   is, and it catches fixed-height layouts.

### What the surface rules cannot see

A script can see `group-hover:` and `100vh`. It cannot see that a control is
covered by another element, that a modal traps focus badly, or that a layout
looks wrong at 768px while declaring the right classes. Those stay **[review]**,
and they are what the five minutes are for.

---

## 6. Rules for agents

This repo is worked on by agents as much as by people. Those agents have the same
budgets and two extra obligations:

1. **State the class and the files up front.** "Class B, `features/boards/`, 6
   files" before the first edit. If the work turns out to be class C, say so and
   stop — do not keep going and report it afterwards.
2. **Never touch a baseline, a lockfile, or a config to make a check pass.** If a
   check fails, the change is wrong until proven otherwise.
3. **Run the gates before saying "done"**: `npm run check` in each package you
   touched, plus `node scripts/check-change-budget.mjs`.
4. **Say what you did not verify.** A passing `tsc` is not a passing UI; if the
   change is visual, name the surface you could not look at.

---

## 7. Review checklist

Ten questions, in order. A "no" stops the review.

1. Is it one concern? Can it be described in one sentence without "and"?
2. Does it fit its change class, or does it carry a `Change-Budget-Exception`?
3. Did any baseline file change? (If yes: why?)
4. Do new files sit where the import matrix says they belong?
5. Does every new component stay under budget, or does the PR explain why not?
6. Was it looked at on mobile, middle, and desktop?
7. Does every new interactive element work without a mouse?
8. Does a behaviour change ship with a test?
9. Does a documented behaviour change ship with a `docs/` update?
10. Can this be reverted by one `git revert`?

---

## 8. What is deliberately not here

- **No CSS linting of arbitrary values.** Tailwind v4 dynamic utilities
  (`z-100`, `w-2xl`) are legitimate; `lint:colors` already guards the tokens.
- **No coverage threshold.** It rewards testing the easy files.
- **No "no `any`" rule.** `tsc` is already strict; a rule on top of it produces
  suppressions, not types.
- **No dependency-count limit.** `AGENTS.md` §1 already decides what may be
  added, and it is a stronger rule than a number.
