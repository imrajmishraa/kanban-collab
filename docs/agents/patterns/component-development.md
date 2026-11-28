# Pattern — component development

The executable form of `docs/component-creation.md` §1: one component, in the
order that makes it reviewable, with the gate that catches each step being
skipped.

Read with [`ui-design.md`](ui-design.md) (what it may look like) and
`docs/change-rules.md` §3 (the budgets).

## The loop

| # | Step | Fails when skipped |
|---|---|---|
| 1 | **`grep` for it first.** The repo has had the same floor as 200 and 240, two `Button`s, four ways to write a store | a second implementation nobody maintains |
| 2 | **Recipe in `DESIGN.md` → `components:` front matter**, then the component | a value no token expresses, added as a literal |
| 3 | **Place it by the import matrix** (`change-rules.md` §4): `components/` if two areas need it, otherwise inside the owning feature | `paths/boundary` or `paths/shared-in-feature` |
| 4 | **Compose, do not flag.** One `variant`/`size` prop, not a row of booleans; parts that travel together are a compound (`Card`, `Card.Header`) | prop count past 8 |
| 5 | **Tokens in Tailwind v4 form**: `bg-(--bg-card)`, `text-(--text-secondary)` — not `bg-[var(--x)]` | `lint:colors` |
| 6 | **Every state exists**: default, hover, `focus-visible`, active, disabled, loading, error, empty | a control with no keyboard path |
| 7 | **Motion**: at most two principles from `DESIGN.md` → *Motion principles*. Zero is a valid answer | motion nobody asked for |
| 8 | **Test next to it**, named after the rule it protects | behaviour with no proof |
| 9 | **Gates**, then look at 320 / 768 / 1024 in both themes | a passing `tsc` read as a working UI |
| 10 | **Report** with the evidence labels of `AGENTS.md` §2 | "looks good" |

## Budgets

| Thing | Limit | Where |
|---|---|---|
| `.tsx` | 400 lines | `check-surface.mjs` |
| `.ts` | 300 lines | `check-surface.mjs` |
| Props | 8 | `component-creation.md` §1.3 |
| Components per file | 1, exported **by name** | `check-paths.mjs` (`multi`) |
| Change | 15 files · 600 added lines | `check-change-budget.mjs` |

## A worked example from this repo

`client/src/features/marketing/motion/` — three wrappers, one per file, named
exports, each with a test beside it:

| File | Props | Test, named after the rule |
|---|---|---|
| `Press.tsx` | 2 | "the wrapper adds no layout" |
| `Rise.tsx` | 7 | "a `Rise` with no `Stagger` above it still renders its content" |
| `Stagger.tsx` | 4 | "children are in the document before the observer fires" |

Read `Press.tsx` for the shape of a small component in this repo, and
`Press.test.tsx` for how a component test is written here: `IntersectionObserver`
and `ResizeObserver` are stubbed the same way `Toaster.test.tsx` stubs them.

The same files were **default** exports when they first landed, against
`component-creation.md` §1.3. `#89` renamed them and added the three tests — that
commit is the reference, not the first version.

## Placement

```
client/src/components/        two or more areas need it
client/src/features/<x>/      one area owns it; exported from features/<x>/index.ts
client/src/hooks/             state and effects, no markup
client/src/lib/               pure: cn, shellLayout, formatting
```

A presentational component never fetches. Data arrives as props, or through a
hook in `hooks/`; a `useQuery` inside markup is how the board view reached 568
lines.

## Anti-patterns

```tsx
// breaks: one component per file, exported by name (check-paths `multi`)
export default function Button() {}
export function IconButton() {}

// breaks: an inline style beats the class and the caller cannot override it
<motion.span style={{ display: "inline-flex" }} />

// breaks: 9 props — this wants a variant split, not another boolean
<Card dense bordered hoverable compact selected loading error empty />

// breaks: a presentational component fetching its own data
function Board() { const { data } = useQuery(…); }
```

## Verification

```
cd client && npm run check        # typecheck, lint, format, three gates, vitest
node scripts/check-change-budget.mjs --strict
```

- [ ] `check-paths --strict` — 0 new findings (no orphan, no boundary, no `multi`)
- [ ] `check-surface --strict` — 0 new findings (no hover-only, no `vh`, no oversized file)
- [ ] The test is named after the rule, not the function
- [ ] Looked at the three surfaces — or named the one you could not
