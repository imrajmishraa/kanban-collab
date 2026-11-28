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
| `transitions.dev` | `agent/action.yml` read; the skill body was not | Unverified | picking a duration and a curve for a transition | — |
| `better-typography` | not inspected | Unverified | spacing, tracking, measure and numerals of a text surface | — |
| `web-typography` | not inspected | Unverified | the same, as a second reading | — |
| `uizze-ui` | not inspected | Unverified | component structure ideas for a prototype | — |
| `impeccable` (`typeset`) | not inspected | Unverified | a typography pass over an existing surface | — |
| `hugeicons` | not inspected | Unverified | choosing, sizing and stroking an icon from the library already in use | — |
| `icons-badges` | not inspected | Unverified | icon and badge patterns, and the motion that carries them | — |
| `better-icons` | not inspected | Unverified | a second reading when an icon is ambiguous | — |
| `pikaicons-skills` | not inspected | Unverified | icon motion only — not an icon set | — |
| `doodle` | not inspected | Unverified | a sketch or hand-drawn accent inside a note | — |
| `vercel-ui-skills` | not inspected | Unverified | component structure for a new surface | — |
| `writing-guidelines` | not inspected | Unverified | voice, tone and house style for `docs/` prose | — |
| `find-skills` | not inspected | Unverified | finding out whether a skill exists before writing the work by hand | — |
| `web-design-guidelines` | not inspected | Unverified | a design review against a published checklist | — |
| `vercel-react-best-practices` | not inspected | Unverified | React structure: hooks, state, rendering | — |
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

## Why so many are Unverified

The sources live in the skills registry each agent installs for itself, not in
this repository, and most of them were not reachable while this file was
written. Nine were: the six Anthropic and Vercel skills already used by the
motion layer, `stageshow`, and the two added in this change.

Recording them as Unverified is the point. A row that says "Verified" is a claim
someone can check; a row that says "Unverified" tells the next agent to read the
skill before trusting this table, which is exactly what `AGENTS.md` §7 already
asks for.

## Adding a row

1. Read the skill's own `SKILL.md` first — not its description, not this table.
2. Add the row here with what you actually read in the Source column.
3. Add the matching row to `AGENTS.md` §7, with the case it must **not** be used
   for. A row without that boundary is the row that gets misused.
4. Run `node scripts/check-agents-skills.mjs --strict`.
