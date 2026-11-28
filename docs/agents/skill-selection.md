# Choosing and combining skills

`AGENTS.md` §7 lists the skills and the case each must not be used for.
[`skill-registry.md`](skill-registry.md) records where each one came from. This
page is the part neither covers: **which one wins when two of them disagree**,
and what a task that needs more than one actually looks like.

## The precedence ladder

Top wins. There is no case where a lower rung overrides a higher one.

| Rung | Document | Decides |
|---|---|---|
| 1 | `DESIGN.md` | what it looks like: colour, type, shape, motion, states |
| 2 | `docs/component-creation.md` | how one component is added: files, exports, props, tests |
| 3 | `docs/change-rules.md` | how big the change may be, and the gates |
| 4 | `AGENTS.md` §7 | whether a skill applies, and what it must not touch |
| 5 | the skill's own `SKILL.md` | how to execute the work inside the rung above |

A skill that asks for something rung 1–3 forbids is not a decision to make: the
repository has already made it. Two examples that come up constantly:

- `theme-factory` wants a palette. `DESIGN.md` has two, both tokenised. The skill
  is for a throwaway artifact; the app keeps its tokens.
- `vercel-composition-patterns` wants a compound component. `component-creation.md`
  §1 caps a component at 8 props and one file. Compose within that, not past it.

## Picking one

1. **Name the question the work answers** before naming a skill. "Which curve
   does this transition use?" — that is `transitions.dev`. "Does this store need
   persistence?" — `zustand-state-management`. A task you cannot phrase as a
   question has no skill.
2. **Search this repository first.** `grep` for the thing you are about to write.
   The repo has had the same floor as 200 and 240, two `Button`s, and four ways
   to write a store. An existing implementation outranks any skill.
3. **One primary skill.** A second is a review pass — read it after the work is
   written, not alongside it.
4. **No row fits?** Run `find-skills`, then ask before using what it turns up:
   which skill, which repository, what it would do here. A yes adds the row to
   `AGENTS.md` §7 and to [`skill-registry.md`](skill-registry.md) in the same
   change.

## Composing

Some tasks cross domains. Compose by **responsibility**, not by topic: each skill
owns one question, and the hand-off between them is explicit.

### A marketing band that animates

| Skill | Owns | Hands to the next |
|---|---|---|
| `stageshow` | the faux board: framing, crop, the one authored action | the still that has to read at a glance |
| `transitions.dev` | the duration and curve of each transition | values inside `DESIGN.md`'s 300ms ceiling |
| `webapp-testing` | the width, keyboard and reduced-motion sweep | screenshots, and what could not be looked at |

Authority: `DESIGN.md` → *Motion principles* decides the numbers. `stageshow`
decides the picture, never the app's tokens.

### A new store

| Skill | Owns |
|---|---|
| `zustand` | the store's shape: slices, selectors, subscriptions |
| `zustand-state-management` | persistence, migration, devtools, reset |
| `zustand-patterns` | an action that has to touch two stores |

Authority: the fifteen existing stores. Read two of them before writing the
sixteenth; a fourth shape is the failure this table exists to prevent.

### A collaborative surface

| Skill | Owns | Boundary |
|---|---|---|
| `yjs` | what goes in the shared document, and as which type | never local UI state |
| `yjs-best-practices` | awareness, undo scope, garbage collection | never the socket |
| `websocket-engineer` | the server's socket: reconnect, backoff, presence | never the document model |

Authority: `docs/realtime-collaboration.md`. The split is already written down;
the skills describe how to work inside each half, not how to redraw the line.

### An API error

| Skill | Owns |
|---|---|
| `api-error-design` | what the response carries: code, message, what the client can act on |
| `error-handling-patterns` | where it is caught, retried or surfaced, on both sides |

Authority: `server/src/shared/errors/` — the factories already exist. A new
`new ApiError(...)` in a controller is the finding, not the fix.

### A documentation page

| Skill | Owns |
|---|---|
| `doc-coauthoring` | the passes: outline, draft, critique |
| `ln-1x0-*-docs-creator` | the shape of that kind of page |
| `writing-guidelines` | voice and house style |

Authority: the page's own neighbours in `docs/`. Read two pages of the same kind
before adding a third.

## What composition is not

- **Not a checklist.** Five skills on one task means four of them were not
  needed. Pick one, add a second only as a review pass.
- **Not additive authority.** Two skills agreeing does not outrank `DESIGN.md`.
- **Not silent.** Every skill used, and every one that applied and was skipped,
  is named in the report with a reason (`AGENTS.md` §7, §8.6).
