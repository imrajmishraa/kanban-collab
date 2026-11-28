# Agent documentation

How an agent works in this repository: which skill applies, what it owns, and
where its instructions stop.

This folder exists because `AGENTS.md` §7 is a **list**, and a list is not a
manual. The section says which skill to reach for and which case it must not be
used for; it cannot say what the skill actually instructs, because the source
lives outside this repository and changes without this repository knowing.

## Read in this order

| Document | Answers |
|---|---|
| [`AGENTS.md`](../../AGENTS.md) | the order of work, the evidence labels, the traps |
| [`skill-registry.md`](skill-registry.md) | where each skill came from, and how much of it was actually read |
| [`skill-selection.md`](skill-selection.md) | which skill wins when two disagree, and how to compose them |

## The one rule

**This folder never overrides the repository.** `DESIGN.md`,
`docs/component-creation.md` and `docs/change-rules.md` decide what the code
looks like and how big a change may be. A skill — and therefore this
documentation of it — sits below all three. See
[`skill-selection.md`](skill-selection.md) for the ladder.

## What is verified here, and what is not

Nine of the forty listed skills had their `SKILL.md` read while this registry was
written; the rest are recorded as **Unverified**, which means: the row tells you
what `AGENTS.md` claims, not what the skill says. Read the skill before trusting
the row.

This is deliberate. A registry that marks everything "verified" is a registry
that has stopped being read.

## How the rest of it lands

Per-skill guides (`docs/agents/skills/<name>/`) are written one domain at a time,
because each one needs the skill's source open and the repository's matching
files open beside it. A guide written without both is a summary, and a summary is
what `AGENTS.md` §7 already is.

| Change | Adds | Needs |
|---|---|---|
| 1 (this one) | the registry, the selection rules, the CI check | — |
| 2 | `patterns/ui-design.md`, `patterns/component-development.md` | `impeccable`, `hugeicons`, `vercel-ui-skills` sources |
| 3 | `patterns/state-management.md` | the three zustand skills, and the fifteen stores read |
| 4 | `patterns/realtime-collaboration.md`, `patterns/error-handling.md` | the yjs and socket skills, `docs/realtime-collaboration.md` |
| 5 | `workflows/` — feature, bug, review, docs | nothing new; they compose the patterns |
| 6 | `skills/<name>/` — one folder per skill, domain by domain | that skill's source |

Each is a class-B change on its own (`docs/change-rules.md` §2). Doing them in
one pull request would be class C with no review path, and the budget gate
already refuses it.

## The gate

```
node scripts/check-agents-skills.mjs --strict
```

Fails when `AGENTS.md` §7 and [`skill-registry.md`](skill-registry.md) disagree,
when a skill is listed twice, when a placeholder id (`ln-*`, `<name>`, TODO)
survives, or when a guide link points at a file that does not exist. It runs as
the `agents` job in `.github/workflows/ci-cd.yml`.

Adding a skill means three edits in one change: the row in `AGENTS.md` §7 (with
the case it must not be used for), the row here (with what you read), and the
gate passing.
