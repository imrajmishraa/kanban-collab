# Creating a component, and using artifact builders

How to add **one** component to the client, and the rules for any tool that
generates UI (claude.ai artifacts, `web-artifacts-builder`, `stageshow`,
`theme-factory`). Read with [`DESIGN.md`](../DESIGN.md) (what it looks like),
[`change-rules.md`](change-rules.md) (how big it may be) and
[`constraints.md`](constraints.md) (what already broke).

---

## 1. One component, in this order

A component is **class A** (`change-rules.md` §2): one folder, one test, ≤ 3 files.
Say so before the first edit.

1. **Look first.** `grep` for it. The repo has had the same floor as 200 and 240;
   a second `Button` is the same bug. Reuse, or extend by `variant`.
2. **Recipe before code.** Add the recipe to the `components:` front matter of
   `DESIGN.md`, then the component (`DESIGN.md` → *Adding to the system*). A value
   that no token expresses is a new token in `index.css`, with a value in
   **both** themes. Never a colour literal (`lint:colors`).
3. **Place it by the import matrix** (`change-rules.md` §4): `components/` if two
   areas need it, otherwise inside the feature that owns it. One component per
   file, named export, ≤ 400 lines, ≤ 8 props.
4. **Compose, do not flag.** Variants are one `variant`/`size` prop, not a row of
   booleans. Parts that always travel together are a compound component
   (`Card`, `Card.Header`), not a prop per slot. State lives in the parent or a
   hook in `hooks/`; a presentational component does not fetch.
5. **Tokens in Tailwind v4 form**: `bg-(--bg-card)`, `text-(--text-secondary)`.
   Not `bg-[var(--x)]`, not `hsl(var(--background))`.
6. **Every state exists**: default, hover, `focus-visible`, active, disabled,
   loading, error, empty. Hover is never the only path; touch target ≥ 44×44
   (`h-11`); an icon-only control has `aria-label` **and** a tooltip with the
   same string.
7. **Motion**: pick at most two principles from `DESIGN.md` → *Motion principles*.
   Zero is a valid answer. Every transition carries `motion-reduce:transition-none`.
8. **Test next to it** (`Name.test.tsx`), named after the rule it protects:
   `"icon-only button exposes its tooltip text as aria-label"`.
9. **Gates**: `npm run check` in `client/`, `node scripts/check-change-budget.mjs`.
   Then look at 320, 768, 1024 in both themes, or say which you could not.
10. **Report** with the evidence labels of `AGENTS.md` §2.

---

## 2. Artifact builders

### What `web-artifacts-builder` is

It scaffolds a React + TypeScript + Vite project with **Tailwind 3.4.1**,
shadcn/ui and Parcel, and bundles it to one HTML file for claude.ai. Its own
description says it is for complex multi-component artifacts, **not** for a
single component.

### Rules

1. **Prototype, not product.** An artifact is for exploring a layout or flow with
   a person. It is never imported by, copied into, or committed under
   `client/src/` or `server/`.
2. **Not for one component.** One component follows §1 directly. Reach for a
   builder only for a multi-screen prototype.
3. **Different stack, so port, never paste.** This repo is Tailwind **v4**
   (`constraints.md` §8) with tokens, not v3 with shadcn theme variables.
   Porting means: shadcn theme variables → `DESIGN.md` tokens; `bg-[var(--x)]`
   and `z-[100]` forms → v4 forms; Radix/shadcn imports → the repo's own
   `components/`. Check `client/package.json` before assuming any of those
   packages is installed; a new dependency needs `constraints.md` §1 and
   `npm audit --omit=dev --audit-level=high`.
4. **Seed the artifact with this repo's tokens.** Copy the `colors:` blocks of
   `DESIGN.md` (dark on `:root`, light on `.light`) and the two fonts into the
   artifact's CSS, so the prototype is judged in the real palette, in both
   themes. A prototype in default shadcn grey proves nothing about this product.
5. **The prototype obeys DESIGN.md**: quiet surfaces, one accent, hairlines not
   shadows, small type, the motion rules. A bundle that needs a drop shadow to
   look finished is not a design for this app.
6. **The deliverable is the ported component**, built by §1, plus a one-line note
   on what the prototype taught. The bundle itself is not committed.
7. **State the class before building.** If porting turns out to touch more than
   one feature folder, it is class C: stop and say so.

### Other tools in the same family

| Tool | Use it for | Never for |
|---|---|---|
| `stageshow` | faux product UI for marketing, docs heroes, feature cards. Its kit lives outside `client/src/`. | the real app. Colour literals in marketing are ledgered in `theme-colors-baseline.json`; do not add to it. |
| `theme-factory` | a throwaway artifact when the person asks for another look | the app. It has two themes, defined in `DESIGN.md`. |
| `frontend-design` | the *process*: commit to a direction, critique it, remove one accessory | its aesthetic freedom. Where it invites bold, distinctive choices, `DESIGN.md` → *Values* wins. |
| `webapp-testing` | the browser sweep: widths, keyboard path, hover-vs-focus, screenshots | claiming a pass without running it |
| `vercel-composition-patterns` | §1 step 4: variants, compound components, lifted state | a reason to exceed 8 props or 400 lines |
| `ui-sdk` | not assessed (see below) | — |

### If a skill was not used

The report says so, in one line each: *skill · used / not used · why*. "Could not
install: no network" is a reason. Silence is not.
