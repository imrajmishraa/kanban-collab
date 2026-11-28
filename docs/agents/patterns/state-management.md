# Pattern — state management

Where client state lives, the shape a store takes here, and the rules that keep
eleven of them readable.

Written from the repository: every file, key and version below was read.
`docs/architecture.md` covers the server side; this page is the browser.

## Where state lives

| Kind of state | Lives in | Example |
|---|---|---|
| Server data — boards, cards, workspaces | TanStack Query, keyed by resource | the board and workspace queries |
| Client state that outlives a route | a zustand store | `stores/activeWorkspace.ts` |
| Layout arithmetic — widths, floors, clamping | a **pure module**, no store | `lib/shellLayout.ts` |
| State one component owns | `useState` in that component | a dialog's open flag |
| URL-owned state — which board, which tab | the router | `/workspaces/:id/boards/:boardId` |

The trap this table prevents: putting layout geometry in a store. `AGENTS.md` §4
records it — a measured width written back into a persisted key, and the
library's intermediate layout saved over the reader's choice. Geometry is
computed (`lib/shellLayout.ts`); the store keeps only what the reader *chose*.

Not every file called a store is zustand. `stores/splashStore.ts` is a
module-level holder with `useSyncExternalStore` — the right shape for something
that has to work before React and the router exist.

## The shape of a store

`stores/activeWorkspace.ts` is the reference. Five parts, in this order:

```ts
export const useActiveWorkspace = create<ActiveWorkspaceState>()(
  persist(
    (set) => ({
      // 1. data, with nulls rather than undefined
      activeWorkspaceId: null,
      lastWorkspaceByUser: {},

      // 2. actions, named for the thing they do
      setActiveWorkspace: (id, name) => set(…),
      clearActiveWorkspace: () => set(…),
    }),
    {
      // 3. a namespaced key
      name: "kanban.activeWorkspace",
      // 4. a version, and a migrate for every bump
      version: 2,
      migrate: (persisted, version) => …,
      // 5. only data — setters are recreated on load
      partialize: (state) => ({ … }),
    },
  ),
);
```

The comments in that file are the ones to copy: they say *why* v2 exists (an old
build auto-selected `workspaces[0]`, so every browser held a selection the user
never made), not what the code does.

## The eleven stores

| File | Key | Version | Owns |
|---|---|---|---|
| `stores/useAuthStore.ts` | — | — | session: status, user, token, and the login / refresh / restore actions |
| `stores/activeWorkspace.ts` | `kanban.activeWorkspace` | 2 | which workspace is open, and the last one per user |
| `stores/theme.ts` | `kanban-theme` | 1 | light / dark / system |
| `stores/rightPanel.ts` | `kanban.right-panel` | 1 | the right panel's mode and width |
| `stores/docsSidebar.ts` | `kanban.docs-sidebar` | 1 | the docs sidebar's collapsed sections |
| `features/boards/stores/boards.ts` | `kanban.boards` | **none** | the board list's client-side view state |
| `features/dashboard/stores/sidebarState.ts` | `kanban.sidebar` | 2 | rail mode, width, `lastVisible`, boards section |
| `features/dashboard/stores/pinnedBoards.ts` | `kanban.pinnedBoards` | **none** | pinned boards |
| `features/search/stores/searchStore.ts` | — | — | the command palette's query and results |
| `features/workspaces/stores/starredWorkspaces.ts` | `kanban:starred-workspaces` | **none** | starred workspaces |
| `features/workspaces/stores/workspaceSwitcher.ts` | — | — | which workspace the switcher is showing |

**Eleven, not fifteen.** `AGENTS.md` §7 says "the 15 stores share one pattern
already"; `grep -rl 'from "zustand"' client/src` returns eleven. Fix the number
where you touch it.

**Four key formats are in use** — `kanban.activeWorkspace`,
`kanban.right-panel`, `kanban:starred-workspaces`, `kanban-theme`. New stores
take `kanban.<camelCase>`; the other three are drift, not a choice.

## Four rules

**1. One writer per piece of state.** `lib/authTokenAccessor.ts` is the single
writer for the token, and its comment explains why the refresh path writes three
fields in one call — a 401 can arrive while the store still says
`unauthenticated`, and writing the token alone leaves a session the route guards
refuse to render.

**2. Read another store; never write it.** `activeWorkspace` reads
`useAuthStore.getState().user?.id` — the allowed direction. Where one store must
*notify* another it imports lazily: `useAuthStore` pulls `clearActiveWorkspace`
in with `await import(…)`, because a static import is a cycle.

**3. Store intent, not measurement.** Persist what the reader chose. `hovering`
is runtime and `collapsed` is derived from `mode`, so neither is in
`sidebarState`'s `partialize`.

**4. Version every persisted store, and write the migration the day you bump it.**
Five stores do. Three do not — `kanban.boards`, `kanban.pinnedBoards`,
`kanban:starred-workspaces` — and the gate already says so: `check-surface`
reports them as `surface/persist-version`, and they sit in
`scripts/surface-baseline.json`. The ledger only shrinks, so the fix is a
`version` plus a `migrate`, and deleting the three entries in the same change.

## Anti-patterns

```ts
// breaks rule 3: a transient mode in a persisted key survives a reload as a
// stuck preview (AGENTS.md §4)
persist((set) => ({ mode: "hover" }), { name: "kanban.panel" });

// breaks rule 2: a store writing another store's state
useSidebarState.setState({ width: 320 });   // from inside another store

// breaks rule 1: a second writer for the token
localStorage.setItem("token", token);

// breaks rule 4: persisted with no version, so a shape change cannot migrate
persist((set) => ({ … }), { name: "kanban.thing" });

// a fourth way to write a store — read two of the eleven first
create<MyState>((set) => ({ … }));
```

## Verification

```
cd client && npx vitest run src/stores src/design
cd client && node scripts/check-surface.mjs --strict
```

- [ ] A persisted store has `name`, `version`, `migrate` and `partialize`
- [ ] Nothing transient or derived is in `partialize`
- [ ] `grep -rn "use[A-Z][A-Za-z]*\.setState" client/src` — every hit is the store's own accessor, or a test
- [ ] The migration has a test: `stores/docsSidebar.test.ts` and
      `design/theme.test.ts` show the shape (a stored envelope, then the
      rehydrated value)
- [ ] `surface/persist-version` reports 0, or the baseline shrank

## Where the zustand skills sit

| Skill | Status | Would own |
|---|---|---|
| `zustand` | Unverified | the shape of a new store |
| `zustand-state-management` | Unverified | persistence, migration, devtools, reset |
| `zustand-patterns` | Unverified | an action that has to touch two stores |

None of the three has been read, so this page does not quote them. What they
would add is vocabulary for the four rules above; the rules themselves come from
the eleven stores, and those are the authority
([`../skill-selection.md`](../skill-selection.md)).
