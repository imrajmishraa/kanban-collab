# Skill registry

Every skill `AGENTS.md` §7 lists, with where it came from, how much of it was
actually read, and which document to follow when you use it.

The table in `AGENTS.md` is the list you read first; this file is the evidence
behind it. `node scripts/check-agents-skills.mjs --strict` fails when the two
disagree, so a row cannot exist in one and not the other.

## Status

| Status | Means |
|---|---|
| **Verified** | The skill's own `SKILL.md` was read, and the "owns" column is what it actually says |
| **Unverified** | The skill is listed, but its source was not available to read. The row records only what `AGENTS.md` claims — do not treat it as the skill's instruction |
| **Planned** | Agreed but not yet written; the guide lands in a later change |
| **Rejected** | Considered and not adopted here, with the reason. Kept visible so the same suggestion does not arrive twice |

**Do not document an Unverified skill as if it were read.** If you use one, say
in the report which parts you relied on and that its source was not inspected.

## The registry

| Skill | Source inspected | Status | Owns | Guide |
|---|---|---|---|---|
| `frontend-design` | anthropics/skills `skills/frontend-design/SKILL.md` | Verified | the process of a new surface: commit to a direction, critique it, remove one accessory | — |
| `web-artifacts-builder` | anthropics/skills `skills/web-artifacts-builder/SKILL.md` | Verified | a multi-screen throwaway prototype; port, never paste | — |
| `theme-factory` | anthropics/skills `skills/theme-factory/SKILL.md` | Verified | a throwaway artifact's palette, on request only | — |
| `stageshow` | benjitaylor/skills `stageshow/SKILL.md` (v1.1.1) | Verified | faux product UI for marketing and docs: framing, crop, one authored action | — |
| `webapp-testing` | anthropics/skills `skills/webapp-testing/SKILL.md` | Verified | the browser sweep: widths, keyboard path, hover-vs-focus, screenshots | — |
| `vercel-composition-patterns` | vercel-labs/agent-skills `skills/composition-patterns/SKILL.md` | Verified | component API shape: variants, compound parts, lifted state | — |
| `ui-sdk` | vercel-labs/ui `packages/core/skills/ui-sdk/SKILL.md` | Verified | unstyled behaviour components, and the ARIA they carry | — |
| `prototype` | mattpocock/skills `skills/engineering/prototype/SKILL.md` | Verified | throwaway code that answers one design question | — |
| `api-and-interface-design` | addyosmani/agent-skills `skills/api-and-interface-design/SKILL.md` | Verified | stable API and module boundaries: contracts, error shape, versioning | — |
| `code-review` | mattpocock/skills `skills/engineering/code-review/SKILL.md` | Verified | a review of a branch or PR since a fixed point, on two axes: the repo's documented standards, and what the spec asked for | — |
| `hugeicons` | hugeicons/hugeicons `skills/hugeicons/SKILL.md` | Verified | choosing, sizing and stroking an icon from the library already in use | — |
| `better-typography` | jakubkrehel/skills `skills/better-typography/SKILL.md` | Verified | how text renders: scale, spacing, features, wrapping, truncation, punctuation | — |
| `web-typography` | wondelai/skills `web-typography/SKILL.md` | Verified | selecting, pairing and loading typefaces — **out of scope for this app**, where the three families are fixed | — |
| `uizze-ui` | uizze/uizze `skills/uizze-ui/SKILL.md` | Verified | UI/UX patterns and real-app examples, in a prototype | — |
| `transitions.dev` | Jakubantalik/transitions.dev `skills/transitions-dev/SKILL.md` | Verified | a transition's duration and curve — and its `transitions review` pass, which finds ad-hoc durations worth tokenising | — |
| `vercel-react-best-practices` | vercel-labs/agent-skills `skills/react-best-practices/SKILL.md` | Verified | React structure and rendering performance | — |
| `web-design-guidelines` | vercel-labs/agent-skills `skills/web-design-guidelines/SKILL.md` | Verified | a review of UI code against the Web Interface Guidelines | — |
| `find-skills` | vercel-labs/skills `skills/find-skills/SKILL.md` | Verified | discovering whether a skill exists before writing the work by hand | — |
| `icons-badges` | not inspected | Unverified | icon and badge patterns, and the motion that carries them | — |
| `better-icons` | not inspected | Unverified | a second reading when an icon is ambiguous | — |
| `pikaicons-skills` | not inspected | Unverified | icon motion only — not an icon set | — |
| `doodle` | not inspected | Unverified | a sketch or hand-drawn accent inside a note | — |
| `vercel-ui-skills` | not inspected | Unverified | component structure for a new surface | — |
| `impeccable` (`typeset`) | not inspected | Unverified | a typography pass over an existing surface | — |
| `writing-guidelines` | not inspected | Unverified | voice, tone and house style for `docs/` prose | — |
| `vercel-deploy` | not inspected | Unverified | Vercel-side deploy steps — the API project only | — |
| `better-auth-best-practices` | not inspected | Unverified | a review of the sign-in flow's shape | — |
| `zustand` | not inspected | Unverified | the shape of a new store | — |
| `zustand-state-management` | not inspected | Unverified | a store's lifecycle: persistence, migrations, devtools | — |
| `zustand-patterns` | not inspected | Unverified | cross-store work | — |
| `yjs` | not inspected | Unverified | the shared document's model: `Y.Map`, `Y.Array` | — |
| `yjs-best-practices` | not inspected | Unverified | awareness, undo scope, and what must never be shared | — |
| `websocket-engineer` | not inspected | Unverified | the server side of the socket: reconnect, backoff, presence | — |
| `api-error-design` | not inspected | Unverified | the shape of an error the API returns | — |
| `error-handling-patterns` | not inspected | Unverified | where a failure is caught, retried or surfaced | — |
| `doc-coauthoring` | not inspected | Unverified | writing a document in passes: outline, draft, critique | — |
| `ln-114-frontend-docs-creator` | not inspected | Unverified | a page about a component or a feature | — |
| `ln-115-devops-docs-creator` | not inspected | Unverified | deploy, CI and environment pages | — |
| `ln-120-reference-docs-creator` | not inspected | Unverified | reference pages: an API surface, options, tables of facts | — |
| `ln-130-tasks-docs-creator` | not inspected | Unverified | runbooks and checklists someone executes | — |
| `ln-140-test-docs-creator` | not inspected | Unverified | what a suite covers, and why | — |
| `platform-encryption-configure` | forcedotcom/sf-skills `skills/platform-encryption-configure/SKILL.md` | Rejected | Salesforce Platform Encryption — not applicable: this repository is Express and MongoDB, with no Salesforce surface | — |
| `popups` | coreyhaines31/marketingskills `skills/popups/SKILL.md` (v2.0.4) | Rejected | popup, modal and banner conversion work — not applicable yet: no popups, no email capture, no CRO experiments in `client/`. Revisit if a waitlist or announcement surface is added | — |

## What is still Unverified, and how to close it

Twenty-four rows are catalogued but not read. Their sources live in the skills
registry each agent installs for itself, not in this repository.

Three ways to close one, in order of trust:

1. **The file your agent installed** — `~/.claude/skills/<name>/SKILL.md` (or
   wherever `npx skills add` wrote it). That is the copy the agent actually
   reads, so it beats anything on GitHub.
2. **The vendor's own repository**, named in the row once confirmed.
3. **A copy somewhere else** — readable, but a different document until someone
   confirms the version. Mark it `Verified` only after that.

`missing-skill-sources.md`, delivered with this change, lists what a GitHub code
search turned up for each one.

## Adding a row

1. Read the skill's own `SKILL.md` first — not its description, not this table.
2. Add the row here with what you actually read in the Source column.
3. Add the matching row to `AGENTS.md` §7, with the case it must **not** be used
   for. A row without that boundary is the row that gets misused.
4. Run `node scripts/check-agents-skills.mjs --strict`.
