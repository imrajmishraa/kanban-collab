# Workflow — documentation

How a page gets written here, and where it goes. `docs/README.md` is the index;
this page is the route to it.

Skill: **`doc-coauthoring`** (unverified — read it first) for the passes; the
`ln-1x0-*-docs-creator` skills are split by page kind in `AGENTS.md` §7.

## Pick the shelf

| The page is about | It goes in | Shape it takes |
|---|---|---|
| a component or a feature | `docs/` | what it does, the files, the states |
| deploy, CI, environment | `docs/` (`deployment.md`, `deploy-split.md`) | steps someone executes |
| an API surface, options, a table of facts | `docs/api-reference.md` | reference, no narrative |
| a runbook or a checklist | `docs/` | numbered steps, each verifiable |
| what a suite covers | beside the suite, or `docs/` | what it proves, and why |
| how an agent should work | `docs/agents/` | the pattern pages and this folder |

Adding a page means adding a row to `docs/README.md` in the same change. A page
nobody can find is not documentation.

## Write it in passes

1. **Outline.** Headings only. If a heading needs a paragraph to explain itself,
   it is two headings.
2. **Draft.** Facts first — file paths, commands, numbers. Prose last.
3. **Critique.** Every sentence either states a fact or tells someone to do
   something. Delete the rest.
4. **Cross-reference.** Link the pattern or doc that owns the neighbouring
   question instead of answering it twice.

## The rules that matter here

- **The code is the source of truth.** When this folder and the code disagree,
  the code is right and the page is the bug.
- **Commands must run.** A command in a page that does not exist is worse than no
  command — it teaches the reader to guess.
- **Paths are relative to the repo root**, and they must resolve. `node
  scripts/check-docs-links.mjs` (slice A4) is the gate for that.
- **Numbers are read, not remembered.** "144 files import `@hugeicons/react`"
  was a `grep -rl | wc -l`, not a memory. A number nobody can reproduce is a
  number that will be wrong next month.
- **No secrets, no real user data** in an example.

## Before you open the PR

```
node scripts/check-agents-skills.mjs --strict
```

- [ ] `docs/README.md` has the row
- [ ] Every relative link resolves
- [ ] Every command was run once, from the repo root
- [ ] Every number has the command that produced it in the commit message or the
      page
