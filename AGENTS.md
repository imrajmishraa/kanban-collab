# AGENTS.md — how to work in this repo

The method for any agent (or person) who changes, reviews or debugs code here.

Read in this order:

1. [`docs/constraints.md`](docs/constraints.md) — constraints that already broke
   production (CommonJS server, cookies, OAuth callback, Tailwind v4), the
   per-package commands, the conventions and the gates.
2. [`docs/change-rules.md`](docs/change-rules.md) — how big a change may be, and
   the gates that fail the build.
3. [`docs/component-creation.md`](docs/component-creation.md) — how to add one
   component, and what an artifact builder may and may not produce here.
4. **This file** — how to get from "something is wrong" to "it is fixed, and here
   is the proof". It does not repeat the two above; it is the order of work.
5. [`DESIGN.md`](DESIGN.md) — before touching the shell (rail, board, column)
   **or adding motion**.

---

## 1. The loop

Do the steps in order. Skipping the first three is how a fix ends up on the wrong
cause.

### 1. Understand the problem — before any edit

- Restate it in your own words: what is expected, what happens, for whom, at
  which width / state / browser.
- Separate **observed** from **diagnosed**. A diagnosis in a ticket or a brief is
  a hypothesis. (Example: "`expand()` restores the minimum" was a reasonable
  diagnosis for a widget that came back at 200px; the cause was a write-back that
  saved the library's intermediate layout over the stored width.)
- Ask for the cause, not the symptom: *who writes this state, and when?* If more
  than one thing writes it, that is usually the bug.
- Ask one question only if you are blocked. Otherwise state your assumption in one
  line and go on.

### 2. Read the real code

- Read the files **at the ref you are asked about** (`git show <ref>:<path>`, or
  the branch in the link). Not memory, not a commit message, not a comment — all
  three have been wrong here.
- For every piece of state you touch, find every writer and every reader.
- For a library, read the docs and types **for the installed version**
  (`package.json` / lockfile). Behaviour changes between minors; when something
  looks surprising, read the release notes before inventing a workaround.
- Open the callers, not just the function.

### 3. Classify and announce

State the change class (A / B / C, `docs/change-rules.md` §2) and the files you
expect to touch, **before the first edit**. If it turns out to be class C, stop
and say so.

### 4. Reproduce before you fix

- Make the bug show up with **numbers**, not adjectives: a failing test, or a
  throwaway harness that prints the wrong value.
- If the logic is tangled with React or a library, pull it into a pure function
  first (no imports of React or the library). Pure code can be fuzzed.
- Good harnesses: a property test over many random inputs (every width from 700
  to 2560; random command sequences), and a table of boundary cases (one pixel
  either side of every floor).
- If you cannot run the code (no browser, no dependencies, no network), say so
  and label every affected claim **Read**, not **Tested** (§2).

### 5. Design the fix

- **One writer per piece of state.** If two things write it, delete one writer
  rather than coordinating them.
- **Store intent, derive the rest.** Persist what the reader chose. Never persist
  a measurement, an intermediate layout or a transient mode (hover, preview).
- **One place for every number.** `grep` before adding a constant: the same
  floor has already existed as 200 and 240, the same ceiling as 360, 420 and 660.
- The smallest change that removes the **cause**. A workaround on top of the
  cause is a second bug.
- Make the impossible request impossible: if a constraint cannot be met, the
  command that would ask for it must refuse or adjust *first*, rather than relying
  on a library to silently do nothing.

### 6. Implement

- One concern per commit. A rename sweep and a behaviour change never share one.
- No drive-by formatting; deleting is free (`change-rules.md` §2).
- Comments say *why*. Fix any stale comment you pass — a comment describing
  behaviour the code no longer has is a defect.
- A behaviour change ships with a test next to the code. Name the test after the
  rule it protects, not the function it calls.

### 7. Verify

- Re-run your harness against the **final** code, not the first draft.
- Run the gates: `npm run check` in each package you touched, and
  `node scripts/check-change-budget.mjs`. `npm run build` for `server/`.
- Delivering a patch: apply it to a clean checkout of the base
  (`git apply --check`), and confirm the result equals your working tree.
- A passing `tsc` is not a working UI. For anything visual, look at it — or say
  which surface you could not.
- Never edit a baseline, lockfile or config to make a check pass.

### 8. Report

Use the template in §3. Lead with what matters, label the evidence, list what you
did not look at. Never write "bug free".

---

## 2. Evidence labels

Every claim in a report carries one of these. If you cannot tell which, it is
**Assumed**.

| Label | Meaning | Say how |
|---|---|---|
| **Tested** | You ran code and saw the result. | The command, or the harness and its numbers. |
| **Read** | You concluded it from reading code. | The file and line; the reasoning in one sentence. |
| **Assumed** | Not verified. | What would verify it. |
| **Not covered** | You did not open it. | List the files. |

"Tested" is for the thing you tested. A pure model passing 48,000 random steps
says nothing about how a React component mounts it — that part is **Read**.

---

## 3. Report templates

### Review (read-only)

```
Summary        one paragraph: what is wrong, and the single most important fix
Bugs           ordered by severity, each: what · where (file:line) · evidence label · fix
Tested         what you ran, and the numbers
Not covered    files and behaviours you did not look at
Next step      what you would do, and what it would cost
```

Severity: **High** — data loss, security, corrupted persisted state, or a
feature that does not work. **Medium** — wrong behaviour on a common path.
**Low** — drift, dead code, cleanup.

### Fix

```
Cause          one paragraph, in terms of who writes what
Change         what the diff does (not a file list)
Behaviour      anything a reader of the diff would not guess
Verification   what ran, what did not
Not in this change   what you saw and left alone
```

A patch is delivered as the diff plus a commit message. Message style is the
repo's: `type(scope): subject`, then *what was wrong → why → what changed →
behaviour to know → verification → not in this commit*.

---

## 4. Traps already found here

Check for these before you call something done.

- **`key in object` as a lookup** also matches `constructor` and `__proto__`.
  Use `Object.hasOwn`. (Found twice: an OAuth provider lookup and a login-error
  message map.)
- **Writing a measured layout back into a persisted store.** The library reports
  intermediate layouts during `expand()` / `resize()`; saving them overwrites the
  reader's width. Write back only when `meta.isUserInteraction` is true.
- **A transient mode in a persisted key.** A hover preview stored as
  `mode: "hover"` survives a reload as a stuck preview, and a `setMode` that
  records "last visible" overwrites what the toggle should restore.
- **Two handlers on one key.** Both fire; a toggle toggled twice is a no-op.
- **Check-then-update on a counter.** Read, compare, increment lets parallel
  requests all read zero. One conditional update (`$lt` + `$inc`) closes it.
- **A reset that refills a budget.** Anything that "starts over" (resend a code,
  reopen a pane) must not hand back what was already spent.
- **TTL rows are not deleted on time.** The monitor runs about once a minute; an
  expired row can still match a query.
- **Unmeasured width = 0.** Treat `0` as "unknown", never as "nothing fits".
- **Numbers that exist twice.** Search for the literal before adding it.

---

## 5. Working with a library

1. Confirm the installed version; read its types, not a blog post.
2. Prefer **one declarative call** over several imperative ones when each of them
   re-runs layout (`Group.setLayout()` over `expand()` + `resize()` +
   `collapse()`). Each imperative call is a separate re-layout that can race the
   next.
3. Read the return value. If the library applies something other than what you
   asked for, log it in development instead of letting it fail silently.
4. A number with no unit may mean pixels in one API and percent in another.
   Check, and write the unit in the name.

---

## 6. UI and layout changes

- Look at mobile, tablet and desktop (`change-rules.md` §5), and at the widths
  where the layout changes shape: 700, 720, 920, 1024, 1280, 1920.
- Every control has a keyboard path and a touch path; hover is never the only way.
- Keyboard shortcuts go through **one** registration. Search for the key before
  binding it.
- Change layout behaviour → change [`DESIGN.md`](DESIGN.md) in the same PR.

---

## 7. Skills, and reporting the ones you did not use

Skills are tools for the loop in §1, not extra authority. Where one disagrees
with `DESIGN.md`, `DESIGN.md` wins.

| Skill | Use when | Does not apply to |
|---|---|---|
| `frontend-design` | planning a new surface: write the plan, critique it against the brief, then build | picking a new palette or type for the app |
| `web-artifacts-builder` | a multi-screen **prototype**; port, never paste (`docs/component-creation.md` §2) | a single component; anything committed under `client/src/` |
| `theme-factory` | a throwaway artifact, on request | the app (two themes, in `DESIGN.md`) |
| `stageshow` | marketing and docs illustrations of the product | app code |
| `webapp-testing` | the width / keyboard / theme sweep of §6, when a browser is available | claiming a pass it did not run |
| `vercel-composition-patterns` | component API shape: variants, compound parts, lifted state | exceeding the 8-prop budget |
| `ui-sdk` | only after its contents have been read | — |
| `better-typography` | checking spacing, tracking, line length and numerals of a text surface | choosing a new family: §Typography in `DESIGN.md` decides |
| `web-typography` | the same, as a second reading when a type scale looks wrong | adding a fourth family |
| `transitions.dev` | picking a duration and curve for a transition | anything outside `DESIGN.md` → *Motion principles* (300ms ceiling, reduced motion) |
| `uizze-ui` | ideas for component structure in a prototype | the app's tokens, radii and shadows (hairlines, no shadows) |
| `impeccable` (`typeset` mode) | a typography pass over a surface: hierarchy, role scale, measure, weight — audit first, then edit | replacing the three families in `DESIGN.md`; the mode improves what is there |
| `hugeicons` | choosing, sizing and stroking an icon from the library already in 139 files | a second icon library: this app has one |
| `icons-badges` | icon and badge patterns, and the motion that carries them | inventing a second icon set |
| `better-icons` | a second reading when an icon is ambiguous or a set looks inconsistent | swapping the library |
| `pikaicons-skills` | icon motion: how an icon animates on hover, press, arrival | its icon library; this app draws from Hugeicons |
| `doodle` | the notes surfaces: a sketch or hand-drawn accent inside a note | the app's chrome; notes are the only place a sketch belongs |
| `vercel-ui-skills` | component structure for a new surface | the token system |
| `writing-guidelines` | reviewing `docs/` and prose for voice, tone and house style | app copy in components; that follows `DESIGN.md` |
| `find-skills` | finding out whether a skill exists before writing the work by hand | — |
| `web-design-guidelines` | a design review of a surface against a published checklist | overriding `DESIGN.md` |
| `vercel-react-best-practices` | React structure: hooks, state, rendering | the layout model in `lib/shellLayout.ts` |
| `vercel-deploy` | Vercel-side deploy steps only — the API project | the web service: that is Render, per `docs/deploy-split.md` |
| `better-auth-best-practices` | a review of the sign-in flow's shape | this repo's auth is its own helper (`lib/authTokenAccessor`), not better-auth |
| `zustand` | the shape of a new store: slices, selectors, subscriptions | the layout model — that is a pure module in `lib/shellLayout.ts`, not a store |
| `zustand-state-management` | a store's lifecycle: persistence, migrations, devtools, a reset between sessions | one store per component; the 15 stores share one pattern already |
| `zustand-patterns` | cross-store work: one action that has to touch two stores | a fourth way to write a store |
| `yjs` | the shared document's model: `Y.Map` / `Y.Array`, and what is shared rather than local | the socket layer — that is `y-websocket` |
| `yjs-best-practices` | awareness, undo scope, garbage collection, and what must never enter a shared doc | the editor's own UI state |
| `websocket-engineer` | the server side of the socket: reconnect, backoff, presence, fan-out | REST endpoints |
| `api-error-design` | the shape of an error the API returns: code, message, and what the client can act on | the copy in the client's error UI |
| `error-handling-patterns` | where a failure is caught, retried or surfaced, on both sides | swallowing a failure — see §4 |
| `doc-coauthoring` | writing or restructuring a document in passes: outline, draft, critique | code comments; `docs/comments.md` decides those |
| `ln-114-frontend-docs-creator` | a page about a component or a feature | API and deploy pages |
| `ln-115-devops-docs-creator` | deploy, CI and environment pages | product pages |
| `ln-120-reference-docs-creator` | reference pages: an API surface, options, tables of facts | tutorials |
| `ln-130-tasks-docs-creator` | runbooks and checklists someone executes | design rationale |
| `ln-140-test-docs-creator` | what a suite covers, and why | the tests themselves |

Motion follows `DESIGN.md` → *Motion principles* (ten principles, at most two per
component).

If a skill from this list applies and you did not use it, say so in the report,
one line each: **skill · not used · why** (`no network`, `not applicable`,
`superseded by DESIGN.md`). Do not list a skill as used because you read its
description.

---

## 8. Definition of done

In addition to [`docs/constraints.md`](docs/constraints.md) and
`docs/change-rules.md` §6–7:

1. The cause is written down in one paragraph.
2. A test, or a harness output, shows the bug before and its absence after — or
   the report says "not run" and why.
3. Every gate passed, or the report names the gate you could not run.
4. `DESIGN.md` / `docs/` updated if a documented behaviour moved.
5. The report lists what was **not** covered.
6. Skills that applied but were not used are listed, with the reason.
