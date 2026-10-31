# Client file structure

Where a file lives in `client/src` is decided by **who owns it**, not by what kind of file it is. Three sentences generate the whole tree:

> A screen is a route, so pages mirror the router. Everything a feature needs lives inside that feature. A file moves into a shared bucket only when a second area needs it — and then it is reached through the feature's `index.ts`, never by path.

## The buckets

| Bucket | Holds | The test |
|---|---|---|
| `pages/` | One file per route, laid out like the URL | Is it mounted by the router? |
| `features/<feature>/` | Everything a domain needs, including its own api, state and types | Would it survive deleting one screen? |
| `components/` | Shared UI: chrome, primitives, cross-feature vocabulary | Do two or more areas import it? |
| `hooks/`, `stores/`, `types/`, `utils/` | Shared non-UI code | Same question |
| `services/` | Transport and providers — the HTTP client, the realtime layer | Does it know about the network? |
| `layouts/` | The shells pages render inside | Does it wrap more than one page? |
| `lib/` | Third-party configuration and app-wide helpers | Is it wrapping someone else's library? |
| `app/` | Bootstrap: router, route tables, guards, providers | Is it wiring rather than UI? |
| `validations/` | Schemas shared by more than one feature | Two or more features? |

## Pages mirror the routes

`pages/` is the route table made visible. A URL segment becomes a folder when it is dynamic (`:workspaceId` → `workspaceId/`) or when other routes sit beneath it; a static segment with nothing under it is just the parent of the page file.

```
pages/
├── LandingPage.tsx                    /
├── FeaturesPage.tsx                   /features
├── auth/LoginPage.tsx                 /auth/login
├── workspaces/
│   ├── DashboardPage.tsx              /workspaces
│   └── workspaceId/
│       ├── WorkspacePage.tsx          /workspaces/:workspaceId
│       ├── boards/
│       │   ├── BoardPage.tsx          .../boards
│       │   └── boardId/
│       │       └── MainBoard.tsx      .../boards/:boardId
│       └── settings/SettingsPage.tsx  /workspaces/~/settings/general
└── account/settings/ProfilePage.tsx   /account/settings/profile
```

Two rules fall out of this. **Pages are exempt from the depth limit** — the URL decides how deep they go, not a house rule. And **a page holds no components of its own**: what it renders comes from its feature, which is why `pages/` has 19 files and no sub-components.

Plain param names (`workspaceId/`), not brackets: a literal `[` is a glob character class to some bundler and path tooling, and it buys nothing here.

## The feature contract

```
features/boards/
├── api/            fetch calls for boards — the UI never calls the client directly
├── components/     boards-only components
├── hooks/          boards-only hooks
├── stores/         boards-only state
├── validations/    boards-only schemas
├── types/          boards-only types
└── index.ts        the public API
```

**`index.ts` is the boundary.** Code outside a feature imports `@/features/boards`, never `@/features/boards/components/BoardHeader`. Nine features have a barrel; each re-exports exactly what outside code actually imports, nothing more. That is what lets a feature rearrange its insides without touching anything else.

One deliberate exception: **lazily loaded sections stay on their deep path.** `pages/LandingPage.tsx` does `import("@/features/marketing/components/landing/WhyKanbanSection")` rather than the barrel, because routing it through `index.ts` would pull the whole marketing feature into one chunk and undo the code-splitting.

## Layers

Six buckets are mounted or consumed from outside and are never "owned" by a feature, so the orphan and ownership rules skip them: `app/`, `layouts/`, `pages/`, `services/`, `lib/`, `validations/`.

`components/` is not a layer. It is a shared bucket with a real test: a component earns its way there when a second area needs it, and moves back into a feature when the second user disappears.

## Rules the checker enforces

`scripts/check-paths.mjs`, wired as `npm run lint:paths`:

| Rule | Meaning |
|---|---|
| `boundary` | A static import reaches past a feature's `index.ts` |
| `shared-in-feature` | A file inside a feature is imported from another area |
| `orphan` | Nothing imports it (layers, barrels, pages and tests excepted) |
| `multi` | A `.tsx` exports more than one component |
| `naming` | A file that declares a component is not `PascalCase.tsx` |
| `depth` | More than four folders under `src/`, pages excepted |

It reads the import graph including dynamic `import()`, so a lazily loaded section is not mistaken for dead code — that mistake made 19 live components look orphaned the first time round.

`npm run lint:paths` reports and exits 0; `-- --strict` exits 1 on anything not in `scripts/paths-baseline.json`. Today's baseline is **28 findings**: 17 orphans, 8 multi-component files, 3 naming. Every one is a real, small piece of debt — the baseline is short enough to read, which is the point.

**A limitation worth knowing.** `shared-in-feature` cannot see through a barrel. `features/workspaces/components/board-dialogs.tsx` is used by boards *and* dashboard, but both reach it via `@/features/workspaces`, so the file's direct importers are all inside its own feature and the rule stays quiet. It is still shared logic in the wrong place; the checker just cannot prove it.

## What the migration did

220 files moved, 361 import specifiers rewritten, in six passes: pages flat, feature components, feature api/hooks/stores/validations, shared components, shared hooks/types/utils, services and layouts. `scripts/migrations/` held the one-off move list; it is deleted now that the moves are history.

Ten files were pinned by hand because a name cannot tell chrome from a feature — `sidebarState`, `searchStore`, `pinnedBoards`, `starredWorkspaces` and `workspaceSwitcher` are chrome state and stayed in `stores/`, while `boards` state went into `features/boards/stores/`. `components/layout/dashboard/…` reads as dashboard, which is exactly why the automatic rule got it wrong.

## Adding to the system

A new screen is a page plus its parts: the page in `pages/` at its route's shape, the components in the feature that owns them. A new feature is a folder with the vocabulary above and an `index.ts` that starts empty.

When this document and the code disagree, the code is right and this file is a bug worth a PR.
