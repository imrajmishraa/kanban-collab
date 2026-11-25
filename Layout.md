# Layout — the workspace shell

The source of truth for how the app's shell is sized, dragged, persisted and
tested. It describes what is **built**, not what is wished for; anything not yet
true is in §11.

> `design.md` §Layout still says "256px rail, 72px collapsed". That was true
> before the rail became resizable. Where the two disagree, this file wins.

---

## 1. What exists today

| Piece | Where | What it owns |
|---|---|---|
| Shell | `client/src/layouts/AppLayout.tsx` | The only writer of `--rail-width` / `--panel-width` |
| Rail maths | `client/src/features/dashboard/lib/railMetrics.ts` | `RAIL` numbers, `computeRail()` → `reserved` |
| Rail state | `client/src/features/dashboard/stores/sidebarState.ts` | mode (`open`/`collapsed`/`hover`/`hidden`), width |
| Rail layout | `client/src/features/dashboard/hooks/useRailLayout.ts` | Mode effects (D3 hide, auto-rail, hover) |
| Column maths | `client/src/components/layout/panelMetrics.ts` | `PANEL` numbers, `computePanel()` → `reserved`, levels |
| Column state | `client/src/stores/rightPanel.ts` | mode, width, level, section; persist v2 |
| Coupling | `client/src/lib/panelCouple.ts` | `couple()`, `besideMax()`, `panelDragLevel()` |
| Drag feel | `client/src/lib/railDrag.ts` | `DRAG_DAMPING`, `dampedWidth()`, `snapToStops()` |
| Tablet | `client/src/lib/tabletLayout.ts` | 700–1023 numbers, rail strip fallback |
| Shared numbers | `client/src/lib/layoutNumbers.ts` | `PAGE_MIN`, `RAIL_MIN`, `RAIL_MAX` |
| Spike (dev only) | `client/src/pages/LayoutSpikePage.tsx` + `pages/layout-spike/` | Proves the rules against `allotment` before the shell moves |
| Spike rules | `client/src/lib/layoutRules.ts` | The settled numbers, per device |

**Engine:** `allotment@1.20.6`, px-native. `react-resizable-panels` was rejected
because it is percentage-only, which would force every pixel rule here to be
derived backwards from a percentage.

**Dev route:** `/layout-spike` (mounted only under `import.meta.env.DEV`).

---

## 2. The rule that holds the shell together

**Width is data: computed once, published as a CSS custom property, read by every
surface that has to line up.** Never a Tailwind width class, never a second copy
of the number.

```
store (mode + width)
  → pure maths (computeRail / computePanel) → reserved
  → AppLayout writes --rail-width / --panel-width
  → main margins · navbar left/right · rail inline width · column inline width
```

Two details that only work because of this shape:

- `reserved` ≠ rendered width. A hover preview renders 288 and reserves 72; a
  hidden rail reserves 0. One function decides both, so they cannot disagree.
- `data-resizing` on the shell root kills the 200ms transition on `#app-rail`,
  `main` and `header` (`styles/components.css`), so all three move at pointer
  speed instead of catching up.

Known leaks (deliberate, listed so they do not grow):

- `useRailLayout.ts` — `PANEL_RAIL_LIMIT = 320` is a literal copy of the
  column's default.
- `tabletLayout.ts` — the 72px strip is a separate literal from
  `RAIL.COLLAPSED`.
- `NotificationsPanel.tsx` — `w-90`; it is a popover, not the column.

---

## 3. Panels that exist

| Panel | Default | Min | Max | Notes |
|---|---|---|---|---|
| Rail (left) | 288 | 200 | 420 | Collapsed is a **mode** at 72, not a width a drag can rest on |
| Right column | 420 | 320 | 660 | Ceiling is `viewport − rail − 420`; tablet 280–420 |
| Board | — | 420 | remaining | Never squeezed below its floor |

Tablet (700–1023): rail opens at 200, may reach 420; column 280–420; when the
three no longer fit, the rail steps aside into a 72px strip (one click back).

**Not built, on purpose:** a bottom panel, a second sidebar, and a vertical
split. Nothing in the app needs them, and the change budget is 15 files / 600
lines per PR — a speculative panel would spend it on a surface no reader opens.

---

## 4. Drag contract

| Number | Value | Why |
|---|---|---|
| Drag start | 3px rail, 6px column | A shaky click must stay a click |
| Damping | 0.6 | 1.0 makes a 1px tremor a 1px layout shift |
| Snap tolerance | 10px | The width sticks at a stop before moving on |
| Rail stops | 200 · 288 · 420 | Below 200 it is not a rail |
| Keyboard | 8px, Shift 32px, Home/End | Home/End jump to the pane's own bounds |

Both edges push each other: with the column open, the rail's maximum is
`viewport − column.min`, so a drag is never capped while the other side has room
to give. The column's own ceiling keeps the board at 420.

A drag never collapses, hides or promotes the icon rail — that is a click or a
shortcut.

---

## 5. Controls

- Rail: `⌘B` open ↔ hidden, `⌘⇧B` collapsed. Single click on its divider hides it.
- Column: `⌘J` open ↔ closed, `⌘⇧J` takes the remaining width. Click on its
  divider closes it.
- Levels: `normal` (all three, each with a floor), `remaining` (the column takes
  what the rail leaves), `full` (the column takes the window, the rail steps off).
- Every divider is a `separator` with live `aria-valuenow`, focusable, and
  keyboard-operable. `allotment` ships none of this; the spike adds it in
  `pages/layout-spike/sashKeys.ts` and the shell already has it.

---

## 6. Persistence

- Rail: `kanban.sidebar` (mode + width). Column: `kanban.right-panel`, **v2**
  (`mode`, `width`, `section`; `level` is a gesture and is deliberately dropped
  on load).
- Anything unrecognised falls back to the default instead of rendering an empty
  surface: `migrate` and `merge` both guard on `isMode` / finite width.
- Default mode is on at 1024+ only (`defaultModeForViewport`); a stored choice
  always wins.
- Responsive fallbacks never write back. A rail that auto-collapsed because the
  window is narrow must not overwrite the width the reader chose.

---

## 7. Responsive

| Range | Behaviour |
|---|---|
| `< 700` | No rail, no group: the column is a full-screen sheet |
| `700 – 1023` | Tablet: rail 200–420, column 280–420, rail strips to 72 when tight |
| `≥ 1024` | Desktop: the full model above |

700, not 640 or 768: `RAIL.MIN_VIEWPORT` is 700 and the column starts at 1024,
so 700–767 has to be tablet or it belongs to nobody. Breakpoint names are layout
states (`tablet`, `desktop`), never device names.

---

## 8. Visual rules

The shell uses tokens, never literals:

| Token | Dark |
|---|---|
| `--bg-root` | `rgb(0, 0, 0)` |
| `--hairline` | `rgba(255, 245, 235, 0.12)` |
| `--brand` | `#ff6b35` |

Dividers are 1px hairlines, invisible until hover, brand-coloured while focused
or on a stop. No decorative motion during interaction; `prefers-reduced-motion`
turns the rest off.

> Briefs that arrive quoting `#080808` and `#ff1f5a` are describing a different
> app. This one is black + orange, and `check-theme-colors` fails any raw hex.

---

## 9. Change discipline

- Gates: `tsc -b`, `eslint src --max-warnings 0`, `prettier --check`,
  `check-surface`, `check-paths`, `check-theme-colors`, `vitest run`.
- Budget: 15 files / 600 added lines per PR. Over that needs a
  `Change-Budget-Exception:` trailer on the PR's own commit.
- Tests sit next to what they test (`*.test.ts` colocated). Tests are not edited
  to make a change pass without saying so first.
- No drive-by refactors: an unrelated bug found on the way goes in the reply,
  not in the diff.

---

## 10. Test status

Covered: `railMetrics`, `panelMetrics`, `tabletLayout`, `panelCouple`,
`panelDragZones`, `railDrag`, `layoutRules` (32 assertions: device boundaries,
settled numbers, invariants, ceiling/remaining formulas, deltas).

Not covered: the spike page's rendering, the `embedded` prop on `RightPanel` /
`DashboardSidebar`, keyboard sash handling. All three need a DOM; jsdom runs out
of memory in the build sandbox, so they are unverified rather than passing.

Known stale assertion: `tabletLayout.test.ts` expects
`tabletRailCeiling(700) === TABLET.RAIL_MAX`; since E6 the ceiling at 700 is 280
(the viewport binds, the board keeps its 420), so that one line needs updating.

---

## 11. Open items

1. `tabletLayout.test.ts` — the stale assertion above.
2. Visual, drag and keyboard behaviour has never been verified by execution:
   the sandbox cannot run a browser or build the app.
3. The spike's `pendingDeltas()` list is live: it empties itself once the app's
   constants catch up. It is currently empty — all four settled deltas landed.
4. `design.md` §Layout needs its 256px line corrected or removed in favour of
   this file.

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
