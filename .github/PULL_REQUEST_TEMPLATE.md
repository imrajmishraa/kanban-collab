## What changed

<!-- One paragraph. Link the issue if there is one. -->

## Why

<!-- The problem this solves. If it changes behaviour, say what users notice. -->

## How it was verified

- [ ] `npm run check` passes in every package touched
- [ ] `npm run build` passes (server changes)
- [ ] New behaviour covered by a test

## Checklist

- [ ] No new ESM-only dependency (see AGENTS.md, constraint 1)
- [ ] Any new env var added to `.env.example` **and** to the hosting platform
- [ ] `docs/` updated if a documented behaviour changed
- [ ] Nothing secret in the diff (tokens, keys, real user data in logs)
