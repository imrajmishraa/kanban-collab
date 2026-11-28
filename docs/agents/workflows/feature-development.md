# Workflow — feature development

The loop of `AGENTS.md` §1, with this repository's commands. One page, four
steps, no restatement of the patterns — those are linked where they apply.

## 1. Before the first edit

```
git switch -c feature/<name> origin/main
grep -rn "<the thing>" client/src server/src
```

- State the **class** (`docs/change-rules.md` §2) and the files you expect to
  touch, in the PR description, before writing code.
- Read the two files nearest the change. For UI that is
  [`../patterns/component-development.md`](../patterns/component-development.md);
  for state, [`../patterns/state-management.md`](../patterns/state-management.md);
  for the socket, [`../patterns/realtime-collaboration.md`](../patterns/realtime-collaboration.md);
  for an error, [`../patterns/error-handling.md`](../patterns/error-handling.md).
- Pick **one** skill ([`../skill-selection.md`](../skill-selection.md)) and name
  it. A second is a review pass.

## 2. While building

- One concern per commit. A rename sweep never shares one with a behaviour change.
- A behaviour change ships with a test beside it, named after the rule it protects.
- Touch a documented behaviour → touch the document in the same change
  (`DESIGN.md`, `docs/`, or this folder).
- Delete rather than comment out; deletion does not count against the budget.

## 3. Gates

```
cd client && npm run check
cd server && npm run check
node scripts/check-change-budget.mjs --strict
node scripts/check-agents-skills.mjs --strict
```

## 4. Look at it

- 320, 768 and 1024, in both themes (`DESIGN.md` themes: `:root` dark,
  `.light-theme` light).
- Keyboard path and touch path for every control.
- Reduced motion on: what does the user see instead?

## 5. Report

`AGENTS.md` §2 labels on every claim — **Tested**, **Read**, **Assumed**, **Not
covered** — and the skill you skipped, one line each. "Not run, and why" is a
complete answer; "looks good" is not.
