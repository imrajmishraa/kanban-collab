# Workflow — bug fixing

`AGENTS.md` §1, in the order that keeps a fix on the right cause. The step people
skip is 3, and it is the one that decides whether the bug comes back.

## 1. Restate it

One paragraph: what is expected, what happens, for whom, at which width, state or
browser. Separate **observed** from **diagnosed** — a ticket's diagnosis is a
hypothesis.

## 2. Read the real code

```
git log --oneline -5 -- <path>
git show <ref>:<path>
```

For every piece of state you touch, find **every writer** and **every reader**.
If more than one thing writes it, that is usually the bug.

## 3. Reproduce it with a number

- A failing test, or a throwaway harness that prints the wrong value.
- Pure logic tangled with React or a library → pull it into a pure function first.
- Good harnesses: a property test over many inputs, and a table of boundary cases
  (one pixel either side of every floor).

Cannot run it? Say so, and label every affected claim **Read**, not **Tested**.

## 4. Fix the cause

- **One writer per piece of state.** Delete the second writer rather than
  coordinating two.
- **Store intent, derive the rest.** Never persist a measurement, an
  intermediate layout, or a transient mode.
- The smallest change that removes the cause. A workaround on top of the cause is
  a second bug.

## 5. Prove it

```
cd client && npm run check
cd server && npm run check
```

Re-run the harness against the **final** code, not the first draft. A test that
only passes before the fix is not evidence.

## 6. Report

Cause in one paragraph (in terms of who writes what), the diff's behaviour, what
ran, and what you left alone. `AGENTS.md` §4 has the traps that have already
bitten this repo — read it before calling it done.
