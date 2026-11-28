# Workflow — code review

`docs/change-rules.md` §7 is the checklist — ten questions, a "no" stops the
review. This page is how to answer them without guessing.

Skill: **`code-review`** (verified) reviews a branch since a fixed point on two
axes: the repo's documented standards, and what the spec asked for. Use it on a
branch or PR; use the loop below on a change you are still writing.

## Read the change, not the summary

```
git log --oneline origin/main..HEAD
git diff --stat origin/main...HEAD
git diff origin/main...HEAD -- <the file you are unsure about>
```

A PR description is a claim. The diff is the change. Where they disagree, the
diff wins and the description is a defect.

## The ten questions, with the command that answers each

| # | Question | How to check |
|---|---|---|
| 1 | One concern? | `git log --oneline` — can each commit be described without "and"? |
| 2 | Fits its class? | `node scripts/check-change-budget.mjs --strict` |
| 3 | A baseline changed? | `git diff origin/main...HEAD -- '*baseline*.json'` — any hit needs a reason |
| 4 | Files in the right place? | `cd client && node scripts/check-paths.mjs --strict` |
| 5 | New components under budget? | `cd client && node scripts/check-surface.mjs --strict` |
| 6 | Looked at three surfaces? | the PR says which, or says which it could not |
| 7 | Works without a mouse? | tab through it; `surface/hover-only` is the script's version |
| 8 | Behaviour change has a test? | the test is beside the code, named after the rule |
| 9 | Documented behaviour moved? | `DESIGN.md`, `docs/`, or `docs/agents/` in the same diff |
| 10 | Revertable in one `git revert`? | no unrelated commit mixed in |

## The three that are missed most

- **A stale comment.** A comment describing behaviour the code no longer has is a
  defect, not a nit — fix it in the same change.
- **A second writer.** Two things writing one piece of state is the shape of most
  bugs in `AGENTS.md` §4. Grep for the setter.
- **A claim with no label.** "Tests pass" without the command, "looks fine"
  without the widths. Ask for the evidence label.

## Report

Use the review template in `AGENTS.md` §3: Summary, Bugs ordered by severity with
`file:line` and an evidence label, Tested, Not covered, Next step. Severity is
**High** for data loss, security, corrupted state or a feature that does not work.
