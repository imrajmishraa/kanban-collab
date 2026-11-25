# Layout — the workspace shell

The source of truth for how the app's shell is sized, dragged, persisted and
tested. It describes what is **built**, not what is wished for; anything not yet
true is in §11.

> `design.md` §Layout still says "256px rail, 72px collapsed". That was true
> before the rail became resizable. Where the two disagree, this file wins.

---

## 1. What exists today

| Piece | Where | What it owns |
| --- | --- | --- |
| Production shell | `client/src/layouts/AppLayout.tsx` | Writes `--rail-width` / `--panel-width`; fixed rail + column, not the group engine |
| Spike shell | `client/src/layouts/DashboardLayout.tsx` | Three-region `react-resizable-panels` group (left / centre / right) |
| Shell coordinator | `client/src/layouts/stores/layoutShellStore.ts` | Pixel sizes, `resizing`, device band, layout → store writes, toggles |
| Rail maths | `client/src/features/dashboard/lib/railMetrics.ts` | `RAIL` numbers, `computeRail()` → `reserved` |
| Rail state | `client/src/features/dashboard/stores/sidebarState.ts` | mode (`open` / `collapsed` / `hidden`), width; persist `kanban.sidebar` |
| Rail layout | `client/src/features/dashboard/hooks/useRailLayout.ts` | Mode effects (hide, auto-rail, hover) for AppLayout |
| Column maths | `client/src/components/layout/panelMetrics.ts` | `PANEL` numbers, `computePanel()` → `reserved`, levels |
| Column state | `client/src/stores/rightPanel.ts` | mode, width, level, section; persist `kanban.right-panel` v2 |
| Panel config (spike) | `client/src/lib/panelConfig.ts` | % defaults + px floors per device for the group |
| Spike rules | `client/src/lib/layoutRules.ts` | Settled numbers, `deviceFor`, ceilings, deltas catalogue |
| Coupling / drag (AppLayout) | `client/src/lib/panelCouple.ts`, `railDrag.ts` | AppLayout dividers: damping, snaps, couple |
| Tablet | `client/src/lib/tabletLayout.ts` | 700–1023 numbers, rail strip fallback |
| Shared numbers | `client/src/lib/layoutNumbers.ts` | `PAGE_MIN`, `RAIL_MIN`, `RAIL_MAX` |
| Spike page | `client/src/pages/LayoutSpikePage.tsx` + `pages/layout-spike/` | Proves the group + stores before AppLayout moves |

**Engine (spike):** `react-resizable-panels` — percentage **shares** with **pixel**
floors (`minSize` in px, `defaultSize` / `maxSize` as `%`). That keeps a side
panel a side panel on a 4K monitor without shrinking past a readable width.

**Engine (production today):** AppLayout still sizes the rail and column with
CSS custom properties and its own dividers — not the group. The spike exists to
prove the group + Zustand path before that migration.

**Dev route:** `/layout-spike` (mounted only under `import.meta.env.DEV`).

---

## 2. The rule that holds the shell together

**Width is data: one store owns mode + width; one computation decides what is
reserved; one place publishes it.**

### Production (`AppLayout`)

```
store (mode + width)
  → pure maths (computeRail / computePanel) → reserved
  → AppLayout writes --rail-width / --panel-width
  → main margins · navbar left/right · rail inline width · column inline width
```

- `reserved` ≠ rendered width. A hover preview can render 288 and reserve 72; a
  hidden rail reserves 0. One function decides both.
- `data-resizing` on the shell root kills the 200ms transition on the rail,
  `main` and header (`styles/components.css`) so they move at pointer speed.

### Spike (`DashboardLayout` + `layoutShellStore`)

```
sidebarState / rightPanel (mode + width)
  → Group layout (%)
  → layoutShellStore.applyLayout → sizes (px) + optional width write-back
  → data-resizing while a sash is dragged
```

- Visibility is store-driven (`expand` / `collapse` on panel refs). Closed panes
  stay **mounted** at zero width so the group does not lose constraints.
- Width write-back skips mid-drag (`resizing === true`) and flushes on pointer-up.

Known leaks (deliberate, listed so they do not grow):

- `useRailLayout.ts` — `PANEL_RAIL_LIMIT = 320` is a literal copy of the
  column's default.
- `tabletLayout.ts` — the 72px strip is a separate literal from
  `RAIL.COLLAPSED`.
- `NotificationsPanel.tsx` — `w-90`; it is a popover, not the column.

---

## 3. Panels that exist

| Panel | Role | Spike config (desktop) | Settled rules (`layoutRules` / `SPIKE`) |
| --- | --- | --- | --- |
| Left (rail) | Sidebar | default `20%`, min **240px**, max `28%` | default **288**, min **200**, max **420**; collapsed mode **72** |
| Centre (board) | Workspace | min **420px**, max `70%` | board floor **420** |
| Right (column) | Activity / panel | default `28%`, min **320px**, max `55%` | default **420**, min **320**, max **660** |

Tablet (700–1023): tighter ceilings in `panelConfigByDevice.tablet`; spike rules
allow rail 200–420 and panel 280–420. When the three no longer fit, production
AppLayout strips the rail to 72px.

**Not built, on purpose:** a bottom panel, a second sidebar, and a vertical
split. Nothing in the app needs them, and the change budget is 15 files / 600
lines per PR.

> `panelConfig` and `SPIKE` / production `RAIL` numbers still disagree in places.
> `pendingDeltas()` on the spike page lists live mismatches. Sign off numbers in
> one table, then align both modules.

---

## 4. Drag contract

| Number | Value | Where |
| --- | --- | --- |
| Drag start (slop) | 3px rail, 6px column | AppLayout dividers (`layoutRules` / `railDrag`) |
| Damping | 0.6 | AppLayout dividers |
| Snap tolerance | 10px | AppLayout dividers |
| Rail stops | 200 · 288 · 420 | AppLayout |
| Keyboard | arrows / Home / End | Library separators on the spike; AppLayout sashes in production |

Spike group:

- Dragging past the right (or tablet left) **max share** flips
  `rightPanel.level` to `remaining` (workspace collapses; column takes the rest).
- A drag never hides the rail — that is a click or `⌘B`.

---

## 5. Controls

| Gesture | Effect |
| --- | --- |
| `⌘B` / `Ctrl+B` | Rail open ↔ hidden |
| `⌘⇧B` / `Ctrl+Shift+B` | Icon rail (collapsed) |
| `⌘J` / `Ctrl+J` | Right column open ↔ closed |
| `⌘⇧J` / `Ctrl+Shift+J` | Column `level` normal ↔ remaining |

Levels:

- **normal** — all three regions, each with a floor.
- **remaining** — column takes what the rail leaves; centre is collapsed (not a 1% sliver).

Spike bar (dev): show/hide rail, open/close panel, toggle rule readout.

---

## 6. State & persistence

| Store | Key | Persists |
| --- | --- | --- |
| `useSidebarState` | `kanban.sidebar` | mode, width, lastVisible, boardsOpen |
| `useRightPanel` | `kanban.right-panel` (v2) | mode, width, section — **not** level |
| `useLayoutShellStore` | `kanban.layout-shell` | device only; sizes are runtime |

Rules:

- Unrecognised persisted values fall back to defaults (`migrate` / `merge` +
  `isMode` / finite width).
- `level` is a gesture: always `normal` after reload.
- Default right-panel mode follows `defaultModeForViewport` (≥ 1024 → panel);
  a stored choice always wins.
- Responsive auto-collapse must not write back over the reader's chosen width.

---

## 7. Responsive

| Range | Behaviour |
| --- | --- |
| `< 700` | No group: spike shows a message; production column is a full-screen sheet |
| `700 – 1023` | Tablet: tighter panel config; rail may strip to 72 in AppLayout |
| `≥ 1024` | Desktop: full model |

Breakpoint names are layout states (`tablet`, `desktop`), never device marketing
names. `deviceFor(viewport)` in `layoutRules.ts` is the spike's source of truth
for which config column applies.

---

## 8. Visual rules

Tokens only — no raw hex in components:

| Token | Dark |
| --- | --- |
| `--bg-root` | `rgb(0, 0, 0)` |
| `--hairline` | `rgba(255, 245, 235, 0.12)` |
| `--brand` | `#ff6b35` |

Dividers are 1px hairlines (`[data-separator]` in `styles/components.css` for
the spike). `data-resizing` disables layout transitions mid-drag.
`prefers-reduced-motion` turns non-essential motion off.

> Briefs quoting `#080808` / `#ff1f5a` describe a different app. This one is
> black + orange; `check-theme-colors` fails raw hex.

---

## 9. Spike file map

```
client/src/
├── layouts/
│   ├── AppLayout.tsx                 # production shell
│   ├── DashboardLayout.tsx           # group shell (spike / future)
│   └── stores/layoutShellStore.ts    # sizes, resizing, applyLayout
├── pages/
│   ├── LayoutSpikePage.tsx
│   └── layout-spike/
│       ├── BoardPlaceholder.tsx
│       ├── RuleReadout.tsx
│       ├── SpikeBar.tsx
│       ├── pendingDeltas.ts
│       └── useViewportWidth.ts
├── lib/
│   ├── panelConfig.ts                # group % / px per device
│   └── layoutRules.ts                # SPIKE numbers, deviceFor, ceilings
```

---

## 10. Change discipline

- Gates: `tsc -b`, `eslint src --max-warnings 0`, `prettier --check`,
  `check-surface`, `check-paths`, `check-theme-colors`, `vitest run`.
- Budget: 15 files / 600 added lines per PR. Over that needs a
  `Change-Budget-Exception:` trailer on the PR's own commit.
- Tests sit next to what they test (`*.test.ts` colocated). Do not edit tests
  only to make a change pass without saying so first.
- No drive-by refactors: unrelated bugs go in the reply, not the diff.

---

## 11. Test status & open items

**Covered:** `railMetrics`, `panelMetrics`, `tabletLayout`, `panelCouple`,
`panelDragZones`, `railDrag`, `layoutRules` (device boundaries, ceilings,
remaining formulas, deltas).

**Not covered (DOM / sandbox limits):** spike rendering, `embedded` on
`RightPanel` / `DashboardSidebar`, live sash keyboard behaviour.

**Open:**

1. Align `panelConfig` mins/defaults with `SPIKE` / production `RAIL` /
   `PANEL` (see `pendingDeltas()`).
2. Move AppLayout onto `DashboardLayout` (or extract a shared group) once numbers
   and a11y are signed off — production still uses CSS variables, not the group.
3. `tabletLayout.test.ts` may still hold a stale ceiling assertion at 700px.
4. `design.md` §Layout: replace the 256px line with a pointer to this file.
5. Confirm whether `Separator` exposes pointer events for `resizing` in the
   installed `react-resizable-panels` version; fall back to group drag callbacks
   if not.

---

## 12. Verification

```bash
cd client
npx tsc -b
npx eslint src --max-warnings 0
node scripts/check-surface.mjs --strict
node scripts/check-paths.mjs --strict
node scripts/check-theme-colors.mjs --strict
npx vitest run
npm run dev            # then open /layout-spike
```
