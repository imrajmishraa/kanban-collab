# Layout — shell rules (Grok-style)

Target behaviour for the kanban workspace shell, aligned with **how grok.com’s
app shell works**: a collapsible left rail, a main stage that always eats the
remaining width, and an optional right surface that appears only when needed —
with **no leftover empty panes** after hide.

This file is the source of truth. Code that disagrees is wrong until this file
changes on purpose.

---

## 1. Regions (same idea as Grok)

```
┌────────────┬──────────────────────────────┬──────────────┐
│  LEFT      │         MAIN                 │  RIGHT       │
│  rail      │         stage                │  surface     │
│  (nav)     │         (board / page)       │  (optional)  │
└────────────┴──────────────────────────────┴──────────────┘
```

| Region | Grok analogue | Kanban content |
| --- | --- | --- |
| Left | Chat history / nav sidebar | `DashboardSidebar` |
| Main | Conversation thread | Board / page (`children`) |
| Right | Artifact / side panel (when open) | `RightPanel` |

Only **main** is required. Left and right are optional surfaces that must fully
leave the layout when closed.

---

## 2. Visibility (Grok-style)

### Left rail — three modes

| Mode | What you see | Width reserved |
| --- | --- | --- |
| **open** | Full nav (labels + structure) | Stored width |
| **collapsed** | Icon rail only (narrow strip) | Collapsed width (~56–72px) |
| **hidden** | **Nothing** — no icons, no strip, no gap | **0** |

Rules:

- **Hide** removes the rail from the layout completely (like closing Grok’s
  sidebar so the chat is full-bleed). Icons must not remain floating in an
  empty column.
- **Collapse** is the icon-only strip (Grok’s compact sidebar), not a half-open
  broken state.
- **Open** restores the **last open width**, not 0 and not a random lock value.

### Right surface

| Mode | What you see |
| --- | --- |
| **open** | Side panel at stored width |
| **closed** | **Nothing** — no empty column, no sash gap |

Same as Grok’s artifact panel: when you close it, main expands into that space.

### Main

Always fills **everything left and right are not using**.  
It only goes away when the right surface is in **remaining** (full side focus)
and the product intentionally covers the stage — otherwise main stays.

---

## 3. Sizing (Grok-like feel)

Grok does not leave the user fighting a stuck drag. Sizes are **pixel-backed**,
remembered, and restored on reopen.

| Region | Min (open) | Default open | Max (drag) | Collapsed |
| --- | --- | --- | --- | --- |
| Left | 200px | 280px | 360px | 64px (icons only) |
| Main | 400px | remainder | — | — |
| Right | 320px | 400px | 560px | 0 (closed) |

Notes:

- Defaults sit in a comfortable mid band (not edge-to-edge on first paint).
- Max keeps the main stage usable; the rail must not eat the whole window.
- **No magic lock widths** (e.g. stuck at 412). If drag stops, it stops at
  **min / max** only.
- On **hide**, do not write `width: 0` into persistence. Remember the last
  **open** width for the next show.

### Responsive

| Viewport | Behaviour |
| --- | --- |
| Wide (≥ 1024) | Full three-region model |
| Medium (700–1023) | Same model, tighter max; prefer collapse over crush |
| Narrow (&lt; 700) | No persistent left column — rail becomes overlay / drawer; right becomes full-screen sheet |

---

## 4. Toggle & drag contract

| User action | Result |
| --- | --- |
| Hide left | Width → 0 in layout; icons gone; separator gone; store keeps last open width |
| Show left | Expand to **stored open width** |
| Collapse left | Icon rail only (~64px) |
| Hide right | Width → 0; separator gone; main expands |
| Show right | Expand to stored width |
| Drag left edge | Between min and max only; settle → persist width |
| Drag right edge | Between min and max; past max may enter **remaining** (main yields) |

**Never:**

- Leave a hollow pane after hide  
- Keep separators active on a hidden side  
- Change `minSize` / `maxSize` constraints only because open/closed flipped  
- Persist 0 as the “open” width  

---

## 5. State (mirrors Grok “remember my sidebar”)

| Concern | Store | Survives reload |
| --- | --- | --- |
| Left mode + last open width | `sidebarState` | Yes |
| Right mode + width | `rightPanel` | Yes |
| Right “remaining” focus | `rightPanel.level` | **No** (session gesture) |
| Live measured px / dragging | `layoutShellStore` | No (except optional device) |

---

## 6. Engine constraints (`react-resizable-panels`)

These are implementation rules so behaviour matches §2–4:

1. Panels stay **mounted**; hide = collapse to 0, not unmount.  
2. **Stable** min/max while a panel can be open — do not set max to 0% on hide.  
3. On **open** transition only: `expand()` then `resize(storedPx → % of group)`.  
4. Separators on a hidden side: zero width, disabled, no hit target.  
5. Do not write width into the store when measured size &lt; min (collapsed).  
6. Stable ids: group `dashboard-shell`; panels `leftPanel`, `centreLayout`, `rightPanel`.

---

## 7. Controls (Grok-like shortcuts)

| Shortcut | Effect |
| --- | --- |
| `⌘B` / `Ctrl+B` | Left open ↔ hidden |
| `⌘⇧B` | Left collapsed (icon rail) |
| `⌘J` / `Ctrl+J` | Right open ↔ closed |
| `⌘⇧J` | Right remaining ↔ normal |

UI also exposes explicit hide/show (spike bar / navbar), same as Grok’s sidebar toggle.

---

## 8. Acceptance (must match Grok-style shell)

On `/layout-spike` (and later production shell):

1. Hide left → **no icons**, no grey column, main full width (minus right if open).  
2. Show left → returns to **last open width** (e.g. ~280), not 0, not stuck ~412.  
3. Collapse left → icon strip only; expand again → full labels at stored width.  
4. Hide right → **no empty pane**, no sash gap.  
5. Show right → stored width.  
6. Reload → modes + open widths restore; “remaining” does not.  
7. Drag left only between min–max; release; hide; show → same width.  

---

## 9. Failure modes (do not ship)

| Symptom | Violates |
| --- | --- |
| Hide left but icons still visible | §2 hidden |
| Empty strip after hide right | §2 right closed |
| Reopen at 0 or ~400+ randomly | §3 / §4 store rules |
| Drag locks mid-range (e.g. 412) | §3 max/min only |
| Constraints change on every toggle | §6.2 |

---

## 10. Files

```
client/src/layouts/DashboardLayout.tsx    # group shell — must match this doc
client/src/layouts/stores/layoutShellStore.ts
client/src/layouts/AppLayout.tsx          # production path until migrated
client/src/pages/LayoutSpikePage.tsx
client/src/pages/layout-spike/*
client/src/lib/panelConfig.ts             # align numbers with §3
client/src/lib/layoutRules.ts
Layout.md                                 # this file
```

---

## 11. Explicitly not Grok (out of scope)

- Grok’s chat model, auth, or branding  
- Bottom panels / multi-column editors  
- Pixel-perfect copy of Grok CSS — **behaviour** is the target, not the skin  

---

*Implementation waits for an explicit go-ahead. When started, change code to
match this document, not the other way around.*
