# Design

How the kanban app looks, moves and is built. This is the reference for anyone adding a screen, a component or a route: the tokens, the rules, the component recipes, and the conventions the code already follows.

The visual language is **ChaiUI**, the chaicode.com design system, applied with the project's own tokens. Section 17 records the mapping rule by rule, so a future reader can tell a decision from a mistake.

The app ships **two themes**, dark and light, plus a `system` mode that follows the OS. Dark is the default and the `:root` palette, so first paint is correct without JavaScript. Every surface, border and text colour below is a token with a value in each theme.

---

## 1. Stack

| Layer | Choice |
|---|---|
| UI | React 19.2, TypeScript, Vite |
| Styling | Tailwind CSS v4 (CSS-first, no `tailwind.config`) |
| Routing | react-router-dom 7 |
| Server state | TanStack Query 5 |
| Client state | Zustand 5 |
| Realtime | Yjs 13 over `y-websocket` |
| Icons | Hugeicons (`@hugeicons/core-free-icons`) |
| Forms | react-hook-form + zod 4 |
| API | Express 4, Mongoose 8, Redis |

Tailwind v4 means there is no config file. Theme values live in `client/src/index.css` as plain CSS custom properties, and components consume them with the arbitrary-property syntax:

```tsx
className="bg-(--bg-root) text-(--text-primary)"
```

Never hardcode a colour in a component. `npm run lint:colors` fails the build if you do.

---

## 2. Tokens

Defined once in `client/src/index.css`: `:root` holds dark, `.light` overrides it. There is no `.dark` block, so there is exactly one source per theme.

### Surfaces

| Token | Dark | Light | Use |
|---|---|---|---|
| `--bg-root` | `rgb(0,0,0)` | `rgb(250,250,250)` | The page. Also the rail, and every popover, menu and dialog |
| `--bg-surface` | `rgb(20,20,21)` | `rgb(255,255,255)` | Reserved for a panel that must lift off the page |
| `--bg-card` | `rgb(26,26,28)` | `rgb(255,255,255)` | Cards and list rows |
| `--bg-elevated` | `rgb(36,36,38)` | `rgb(255,255,255)` | Reserved. Floating surfaces use `--bg-root` instead |
| `--bg-hover` | `rgba(255,255,255,.05)` | `rgba(0,0,0,.04)` | Hover fills |
| `--bg-active` | `rgba(255,255,255,.08)` | `rgba(0,0,0,.06)` | Pressed fills |

Two rules govern surfaces.

**A background is a surface or a tint. Never a colour.** A panel, row, chip or bar takes `--bg-root`, one of the surface steps, a `--tint-*`, or `transparent`. Status meaning travels in the text colour, not in a coloured fill.

**A floating surface is the page colour.** Popovers, menus, dialogs and sheets sit on `bg-(--bg-root)` and are separated by a hairline. `--bg-elevated` exists but is not used for them: a grey panel on a black page reads as a different material, not as a layer.

### Washes

One scale, so a component asks for a strength and the theme decides whether that strength is white or black.

| Token | Dark | Light |
|---|---|---|
| `--tint-2` | `rgba(255,255,255,.02)` | `rgba(0,0,0,.02)` |
| `--tint-3` | `.03` | `.025` |
| `--tint-4` | `.04` | `.03` |
| `--tint-5` | `.05` | `.035` |
| `--tint-6` | `.06` | `.045` |
| `--tint-8` | `.08` | `.06` |
| `--tint-10` | `.10` | `.08` |
| `--tint-15` | `.15` | `.12` |

Use `--tint-4` for a hover on a row that already has a background, `--tint-6` for a selected row, `--tint-8` for an open menu trigger, `--tint-3` for a field or a quiet panel.

### Edges

| Token | Dark | Light | Use |
|---|---|---|---|
| `--hairline` | `rgba(255,245,235,.1)` | `rgba(60,30,10,.12)` | Every panel edge, divider and row separator |
| `--hairline-strong` | `rgba(255,245,235,.18)` | `rgba(60,30,10,.22)` | Floating panels, focused fields, open triggers |
| `--border` | `rgba(255,255,255,.1)` | `rgba(0,0,0,.1)` | Neutral edges where the warm tone would be wrong |
| `--border-strong` | `rgba(255,255,255,.16)` | `rgba(0,0,0,.18)` | |
| `--border-subtle` | `rgba(255,255,255,.06)` | `rgba(0,0,0,.06)` | |

The warm hairline is the default edge in this system. `--border` is the exception, used inside dense data surfaces where a warm line would tint the content.

### Text

| Token | Dark | Light | Use |
|---|---|---|---|
| `--text-primary` | `rgb(245,245,245)` | `rgb(17,17,17)` | Headings, active rows, values |
| `--text-soft` | `rgb(204,204,204)` | `rgb(56,56,56)` | Row labels at rest |
| `--text-secondary` | `rgb(163,163,163)` | `rgb(90,90,90)` | Body copy, meta |
| `--text-muted` | `rgb(120,120,120)` | `rgb(120,120,120)` | Icons at rest, placeholders, timestamps |
| `--text-subtle` | `rgb(72,72,72)` | `rgb(165,165,165)` | Inert text, disabled labels |

### Accent and brand

| Token | Dark | Light | Use |
|---|---|---|---|
| `--accent` | `rgb(255,224,178)` cream | `rgb(146,64,14)` amber | The one highlight. Active icons, a highlighted phrase, an active segment |
| `--accent-soft` | cream at `.14` | amber at `.1` | The wash behind an accent chip or a hint |
| `--accent-fill` | `rgba(124,45,18,.4)` | amber at `.16` | The active fill of a segmented control |
| `--brand` | `#ff6b35` | `#c2410c` | The logo, a link on hover, the focus ring |
| `--brand-hover` / `--brand-active` | `#ff814f` / `#e95725` | `#9a3412` / `#7c2d12` | |
| `--brand-muted` / `--brand-border` | brand at `.1` / `.3` | brand at `.1` / `.32` | |

Cream only works on black, so the accent flips to deep amber in light. `#ff6b35` is about 2.6:1 on `rgb(250,250,250)` and cannot carry text, which is why the light brand is `#c2410c`.

### Actions

| Token | Dark | Light | Use |
|---|---|---|---|
| `--solid-bg` | `rgb(255,255,255)` | `rgb(10,10,10)` | The one solid button on a screen |
| `--solid-bg-hover` | `rgb(229,229,229)` | `rgb(38,38,38)` | |
| `--solid-text` | `rgb(10,10,10)` | `rgb(250,250,250)` | The text on it |

The solid button inverts with the theme: white on black in dark, near-black on white in light.

### Special purpose

| Token | Dark | Light | Use |
|---|---|---|---|
| `--on-color` | `rgb(10,10,10)` | `rgb(10,10,10)` | Ink on a coloured disc: avatar initials, presence dots. Does not flip, because the identity palette does not |
| `--inverse-bg` | `rgb(245,245,245)` | `rgb(17,17,17)` | The tooltip capsule, which turns its back on the theme |
| `--inverse-text` | `rgb(10,10,10)` | `rgb(250,250,250)` | |
| `--inverse-border` | `rgba(0,0,0,.12)` | `rgba(255,255,255,.14)` | |
| `--inverse-accent` | `rgb(146,64,14)` | `rgb(255,224,178)` | The highlighted phrase inside an inverted capsule |
| `--glass` | `rgba(13,13,13,.72)` | `rgba(255,255,255,.72)` | `.glass-surface` |
| `--scrim` | `rgba(0,0,0,.55)` | `rgba(0,0,0,.35)` | Behind a dialog |
| `--scrollbar-thumb` / `-hover` | `#292929` / `#3a3a3a` | `#d4d4d4` / `#b4b4b4` | |
| `--success` / `--warning` / `--danger` | `#35d399` / `#f5b84b` / `#f16b7a` | `#047857` / `#a16207` / `#be123c` | Text and 1px edges only |

---

## 3. Orange is never a fill

The strictest rule in the system. Orange carries meaning, so it must not become decoration.

Allowed:

- The logo.
- `text-(--brand)` on a link or an icon that is being hovered.
- The focus ring, which is a 2px outline.
- A 1.5px dot for unread, and the badge glint.
- The active fill of a segmented control, in dark brown (`--accent-fill`) with cream text, not orange.
- `text-(--accent)` on an active row's icon. That is a text colour.

Not allowed: orange buttons, orange status pills, orange card borders, orange progress bars, orange section headers, and any orange wash behind a panel.

A primary action is **the solid button**, one per screen:

```tsx
className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-none rounded-tr-lg rounded-bl-lg bg-(--solid-bg) px-4 text-sm font-medium text-(--solid-text) transition-colors duration-200 hover:bg-(--solid-bg-hover) motion-reduce:transition-none"
```

Secondary is the outline with mirrored corners:

```tsx
className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-none rounded-tl-lg rounded-br-lg border border-(--hairline-strong) bg-transparent px-4 text-sm font-medium text-(--text-soft) transition-colors duration-200 hover:bg-(--tint-4) hover:text-(--text-primary) motion-reduce:transition-none"
```

Danger is red text on a neutral fill, and only inside a confirm dialog.

---

## 4. Type

| Role | Family | Size and weight |
|---|---|---|
| UI text | Plus Jakarta Sans | 12.5px to 14px, 400 to 500 |
| Headings | Plus Jakarta Sans | 19px to 26px, 600 to 700, `tracking-tight` |
| Data labels, keys, timestamps | JetBrains Mono | 9px to 10px, uppercase, `tracking-[0.14em]` |

Both are loaded from Google Fonts in `client/index.html`. Body copy never uses the mono face; mono is reserved for numbers, keycaps and small labels where alignment matters. Numbers in columns get `tabular-nums`.

---

## 5. Shape and depth

- Controls and rows: `rounded-lg`.
- Panels and popovers: `rounded-xl`.
- Dialogs: `rounded-2xl`.
- Avatars and dots: full circle.
- Buttons: `rounded-none rounded-tr-lg rounded-bl-lg`, mirrored for secondary.

**No shadows on cards, panels or popovers.** Depth comes from a hairline and, where needed, one step of lightness. A shadow on a black page reads as grime.

---

## 6. Motion

| What | Duration | Curve |
|---|---|---|
| Colour, hover, focus | 150ms | `ease` |
| Layout shifts, width, accordion | 200ms | `ease-out` |
| Menus and popovers | 150ms to 200ms | opacity plus a 2px translate |
| The theme reveal | 2000ms | see below |

Rules:

- Animate `transform`, `opacity`, `width`, `max-height`, `clip-path`. Never `box-shadow`.
- Every transition carries `motion-reduce:transition-none`.
- Menus appear by opacity and a small translate, never by scale: scaling text looks like a zoom bug.

### The theme reveal

`lib/themeReveal.ts` wraps the class flip in a View Transition and clips the snapshot to a circle centred on the control that was pressed.

- **Dark to light**: the new frame opens out of the button, `cubic-bezier(0.22, 1, 0.36, 1)`.
- **Light to dark**: the old frame closes back into it, `cubic-bezier(0.64, 0, 0.78, 0)`, which is the same curve reversed in time.
- Both start and end at the button's own radius, so the two directions are exact mirrors.
- `fill: "both"` holds the first and last frames, or the clip is released early and the page flashes.
- The origin is published as `--vt-x`, `--vt-y`, `--vt-seed` before the transition starts, so the incoming frame is already clipped on its first paint.
- `.vt-grow` and `.vt-collapse` in `index.css` do the pre-clip and the layer swap.
- No View Transitions, or reduced motion, and the theme changes with no animation at all.

---

## 7. Layout

```
+--------------+------------------------------------------+
|              |  navbar 56px, fixed, blurred on scroll   |
|  sidebar     +------------------------------------------+
|  256px       |                                          |
|  (72px       |  page content                            |
|   collapsed) |  max-w-7xl, px-5 sm:px-6 lg:px-8, py-6   |
|              |                                          |
+--------------+------------------------------------------+
```

- Rail: `w-64` expanded, `w-18` collapsed, `transition-[width] duration-200`.
- Navbar: `h-14`, `fixed top-0 right-0`, offset `left-64` or `left-18` to match the rail, `z-50`.
- Main: `ml-64` or `ml-18`, `h-screen`, `overflow-y-auto`.
- Rail z-index: `z-40`, and `z-60` while it floats open over the page in hover mode, so it wins against the navbar it covers.
- Page frame: `BoardShell` gives every in-app page the same width and padding.

Stacking order, low to high: rail 40, navbar 50, floating rail 60, popover and menu 80, dialog 100, tooltip 999.

Mobile is a separate composition: the rail becomes a drawer (`MobileSidebar`, `w-72`), the navbar is replaced by a compact header, and the page keeps its own scroll.

---

## 8. Shell anatomy

### Rail

Top to bottom: brand, **Find** (`F`), primary navigation, then the account footer.

- Collapsed controls are one step larger than they look: header button `size-10` with the mark at `h-9 w-9`, search `size-9`, footer avatar `size-10` with a 28px avatar, nav rows `h-10 w-10` with a `size-6` icon box.
- Every control centres on the rail's midpoint. Nothing offsets.
- Three modes, set from the account menu's Sidebar row: `open`, `collapsed`, `hover`. In `hover` the rail opens on pointer enter and the collapse control is replaced by a pin.
- Navigation: `Overview`, `Boards`, `Notes`, `Members`, a hairline, then `Activity` and `Settings`.

### Footer

Avatar, name, and a three-dots affordance. The whole row is one button that toggles the account menu; the dots are decoration, not a second control. In hover mode the pointer opens the menu and a click closes it.

### Navbar

Left: grid icon, workspace switcher, and on board routes a second chevron with the board switcher. Centre: the page title, `pointer-events-none`. Right: search, notifications.

With no workspace selected the switcher collapses to an "All Workspaces" pill on every route, not just the overview.

---

## 9. Routes

| Path | Screen | Gate |
|---|---|---|
| `/`, `/features`, `/how-it-works` | Marketing | public |
| `/auth/login`, `/auth/register`, `/auth/forgot-password` | Auth | guest only |
| `/auth/callback` | OAuth return | public |
| `/workspaces` | Workspace overview | authenticated |
| `/workspaces/:workspaceId` | One workspace | authenticated |
| `/workspaces/:workspaceId/boards` | Board list | `RequireWorkspace` |
| `/workspaces/:workspaceId/boards/:boardId` | Board canvas | authenticated |
| `/workspaces/:workspaceId/{notes,members,activity}` | Workspace pages | `RequireWorkspace` |
| `/account/settings/{profile,notifications}` | Account | authenticated |
| `/workspaces/~/settings/{general,notifications}` | Workspace settings | `RequireWorkspace` |

`RequireWorkspace` renders a picker in place when nothing is selected: the destination's name, a search field, the workspace list, and a create button. It does not redirect.

---

## 10. Component recipes

Copy these. Every one is on tokens, on the hairline, and free of shadow.

### Buttons

| Variant | Classes | When |
|---|---|---|
| Solid | `h-9 rounded-none rounded-tr-lg rounded-bl-lg bg-(--solid-bg) px-4 text-sm font-medium text-(--solid-text) hover:bg-(--solid-bg-hover)` | One per screen, the primary action |
| Outline | `h-9 rounded-none rounded-tl-lg rounded-br-lg border border-(--hairline-strong) px-4 text-sm font-medium text-(--text-soft) hover:bg-(--tint-4) hover:text-(--text-primary)` | Beside the solid one |
| Ghost | `h-8 rounded-lg px-2.5 text-(--text-secondary) hover:bg-(--tint-4) hover:text-(--text-primary)` | Rows, toolbars, icon-free actions |
| Danger | `h-9 rounded-lg border border-(--danger)/30 px-4 text-(--danger) hover:bg-(--tint-4)` | Inside a confirm dialog only |

Every button carries `cursor-pointer transition-colors duration-200 motion-reduce:transition-none` and `disabled:cursor-not-allowed disabled:opacity-40`.

### Icon button

```tsx
className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-(--text-muted) transition-colors duration-200 hover:bg-(--tint-4) hover:text-(--text-primary) motion-reduce:transition-none"
```

Icon-only means `aria-label` plus a tooltip whose label matches it.

### Theme controls

Three-mode segmented control, for System, Light and Dark:

```tsx
<div role="group" aria-label="Theme" className="flex shrink-0 items-center gap-0.5 rounded-full border border-(--hairline) bg-(--tint-3) p-0.5">
  {THEMES.map((entry) => (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={entry.mode === mode}
      aria-label={entry.label}
      onClick={(event) => setThemeMode(entry.mode, event.currentTarget)}
      className={[
        "flex size-6 cursor-pointer items-center justify-center rounded-full",
        "transition-colors duration-150 motion-reduce:transition-none",
        entry.mode === mode
          ? "bg-(--tint-10) text-(--accent)"
          : "text-(--text-muted) hover:text-(--text-primary)",
      ].join(" ")}
    >
      <HugeiconsIcon icon={entry.icon} size={12} strokeWidth={1.7} />
    </button>
  ))}
</div>
```

Two details matter. `role="menuitemradio"` with `aria-checked`, because it is a choice inside a menu, and `event.currentTarget` passed to `setThemeMode`, because that is the origin the reveal starts from.

A single toggle button, where one control flips between two themes:

```tsx
<button
  type="button"
  aria-label={theme === "dark" ? "Switch to light" : "Switch to dark"}
  onClick={(event) => setThemeMode(theme === "dark" ? "light" : "dark", event.currentTarget)}
  className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-(--text-muted) transition-colors duration-200 hover:bg-(--tint-4) hover:text-(--text-primary) motion-reduce:transition-none"
>
  <HugeiconsIcon icon={theme === "dark" ? SunIcon : MoonIcon} size={16} strokeWidth={1.7} />
</button>
```

The icon shows the destination, not the current state.

### Segmented control

For two or three mutually exclusive options in a row, such as the feedback category:

```tsx
<div role="group" className="flex overflow-hidden rounded-md border border-(--hairline)">
  <button className="h-8 flex-1 px-2 text-[12px] font-medium bg-(--accent-fill) text-(--accent)">Something broke</button>
  <button className="h-8 flex-1 border-l border-(--hairline) px-2 text-[12px] font-medium text-(--text-secondary) hover:text-(--text-primary)">An idea</button>
</div>
```

The active segment is the one place a fill is allowed to be a colour, and it is dark brown with cream text, never orange.

### Chips and tags

```tsx
className="inline-flex items-center rounded-full border border-(--hairline) bg-(--tint-4) px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-(--text-soft)"
```

A card label keeps its identity colour as **text**, with a neutral fill and a hairline edge. Never fill a chip with its own colour.

### Fields

```tsx
<input className="h-9 w-full rounded-lg border border-(--hairline) bg-transparent px-3 text-sm text-(--text-primary) placeholder:text-(--text-subtle) outline-hidden transition-colors duration-200 focus:border-(--hairline-strong) motion-reduce:transition-none" />
```

- No orange focus halo. The border firms up, and the global `:focus-visible` ring is suppressed for fields in `index.css`.
- A label above at `text-sm font-medium text-(--text-soft)`, a hint below at `text-[11px] text-(--text-muted)`.
- An error state is `border-(--danger)/50` with `text-(--danger)` under it, never a filled red field.

### Popover and menu

```tsx
className="absolute z-80 overflow-hidden rounded-xl border border-(--hairline-strong) bg-(--bg-root) p-1"
```

Rows inside are `h-8 rounded-md px-2.5 text-[12.5px] text-(--text-soft) hover:bg-(--tint-4) hover:text-(--text-primary)`, with the icon at `text-(--text-muted)` lifting on `group-hover`.

### Dialog

```tsx
<div className="fixed inset-0 z-100 flex items-center justify-center bg-(--scrim) p-4 backdrop-blur-sm">
  <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="w-full max-w-md rounded-2xl border border-(--hairline) bg-(--bg-root) p-6">
```

Escape closes it, a pointerdown on the backdrop closes it, and focus moves to the first thing worth typing in.

### Tooltip

The capsule **inverts**: light on a dark page, dark on a light one.

```tsx
className="border border-(--inverse-border) bg-(--inverse-bg) text-(--inverse-text)"
```

The arrow matches, and the optional highlight phrase uses `text-(--inverse-accent)` on an inverted shape and `text-(--accent)` on the shapes that keep page colours (`glass`, `neon`, `gradient`, `badge`, `outline`, `ink`, `terminal`).

### Avatars

```tsx
className="inline-flex items-center justify-center rounded-full font-mono text-[9px] font-semibold text-(--on-color)"
style={{ background: identityColor(id) }}
```

The identity palette is the same in both themes, so the ink on it is `--on-color`, which does not flip. Initials are the fallback for a missing image, never an empty circle.

### Toasts, skeletons, empty states

- Toast: `rounded-xl border border-(--hairline) bg-(--bg-root) px-3.5 py-2.5 text-[12.5px]`, with a 1px semantic edge and the message in `--text-soft`.
- Skeleton: `animate-pulse rounded bg-(--tint-6)`, shaped like the content it replaces, never a spinner in an empty box.
- Empty state: an icon in a hairline circle, one sentence, and an action if there is an obvious one.

---

## 11. Keyboard

| Key | Action | Scope |
|---|---|---|
| `F` | Open Find | Anywhere outside a text field |
| `N` | Open notifications | Anywhere outside a text field |
| `⌘K` / `Ctrl+K` | Search palette | Everywhere except board routes |
| `⌘I` or `⌘K` | Card palette | Board routes |
| `⌘⇧K` | New project | Rail |
| `Enter` / `Shift+Enter` | Submit / newline | Text fields |
| `Esc` | Close the top overlay | Overlays |

Every global handler ignores events while the caret is in an `input`, `textarea`, `select` or contentEditable element, and ignores modified keys. Guard `event.key` with `?? ""`, because not every keydown that reaches the window carries one.

---

## 12. States

Every data surface answers four questions.

1. **Loading.** Skeletons shaped like the real content.
2. **Empty.** An icon in a hairline circle, one sentence, an action if there is one. "Nothing has happened yet", not "No data".
3. **Error.** What failed, in plain words, and a retry.
4. **Partial.** Infinite lists show a "Loading more" row, and "End of activity" when the cursor runs out.

Realtime surfaces also show who is present, and reconcile after a reconnect rather than silently diverging.

---

## 13. Copy

- **No em dashes anywhere.** Use a comma, colon, full stop or brackets.
- Sentence case for labels, headings and buttons: "Create workspace", not "Create Workspace".
- All caps only for data labels, and always with `tracking-[0.14em]`.
- Second person, active voice, no exclamation marks.
- Name the thing, not the mechanism: "Back to project view", not "Clear active workspace".
- Empty states and errors are sentences, not fragments.
- Times are relative under a week ("3h ago") and absolute beyond it.

---

## 14. Accessibility

- Icon-only controls carry `aria-label`, and their tooltip matches it.
- Toggle state uses `aria-expanded`, `aria-pressed` or `aria-checked`, never colour alone.
- Hidden but mounted panels get `inert` and `aria-hidden`, so nothing offscreen is tabbable.
- The global ring is `outline: 2px solid var(--brand)`. It is suppressed for text fields and for `[tabindex="-1"]` containers focused only to catch arrow keys.
- Decorative icons and dividers are `aria-hidden="true"`.
- Body text targets 4.5:1 in both themes. `--text-muted` is for meta only, never a control label.
- A theme change is a preference, not a mode: the control reflects `mode`, which can be `system`.

---

## 15. Code conventions

```
client/src/
  app/          router, layouts, providers, route guards
  features/     one folder per domain: boards, workspaces, notes, activity, settings
  components/   layout/ (composition), ui/ (primitives), Tooltips/
  hooks/        dashboard and auth hooks
  lib/          themeReveal and small helpers
  stores/       Zustand stores: theme, sidebarState, activeWorkspace
  api/          one module per resource, typed
  types/        API and domain types
  validations/  zod schemas shared with the server
```

- Aliases: `@/` for `src`, `@components/` for `src/components`.
- API modules return unwrapped payloads, so callers never touch the envelope.
- One query key object per resource, invalidated after mutations.
- Stores hold what survives a navigation; the query cache holds what the server owns.
- Tailwind only. Inline `style` is for computed values: a width from a measurement, an identity colour from an id.
- `npm run lint:colors` fails on a raw palette utility, a hardcoded hex, a raw white or black wash, and the malformed `bg-(var(--x))` shorthand.

### React Compiler rules this codebase has been bitten by

These pass `tsc`, so the compiler is the gate:

- **No mutation during render.** Derive, do not accumulate.
- **Declare state above the callbacks that use it.**
- **No `window` reads during render.** Use `useLocation()`.
- **Effects that write state must not fight the URL.** Guard with a "synced this route" key.
- **A reset effect is usually the wrong shape.** Derive from a key, or let the component unmount.

---

## 16. Do and don't

| Do | Don't |
|---|---|
| Backgrounds from surfaces and tints | A coloured fill behind a panel, chip or bar |
| Hairline borders for separation | Shadows on panels |
| Floating surfaces on `bg-(--bg-root)` | A grey popover on a black page |
| One solid button per screen | Orange filled buttons |
| `--on-color` ink on an avatar disc | `--solid-text` on a coloured disc |
| Inverted tooltip capsule | A page-coloured tooltip on a page |
| `motion-reduce:transition-none` on every transition | Unconditional animation |
| `aria-label` on icon buttons, tooltip to match | Tooltip on a control that already has text |
| Sentence case, no em dash | Title Case, em dash |
| Skeleton shaped like the content | Spinner in an empty box |
| Guard `event.key` with `?? ""` | `event.key.toLowerCase()` on an unguarded event |

---

## 17. ChaiUI alignment

The design language is ChaiUI, the chaicode.com look: neutral near-black, white type, one quiet cream accent, warm hairlines, and orange almost nowhere. Premium comes from restraint.

Sources, in priority order:

1. `https://ui.chaicode.com/.well-known/skills/chaiui/SKILL.md` for the rules.
2. `https://ui.chaicode.com/.well-known/skills/chaiui/references/components.md` and `recipes.md` for exact class strings.
3. The live docs, which show every component in both themes.

This project hand-builds from the recipes on Tailwind v4. There is no shadcn and no `components.json`, so `npx shadcn add @chaiui/...` does not apply.

### Adopted without change

| ChaiUI rule | Where it shows up |
|---|---|
| Orange is never a fill, with the same allow-list | Section 3 |
| Cream as the accent, one highlighted phrase per paragraph | `text-(--accent)`, the tooltip highlight |
| Warm hairlines, no shadow on cards or panels | Every surface |
| Solid button corners `rounded-none rounded-tr-lg rounded-bl-lg`, one per screen | Section 10 |
| Outline button with mirrored corners | Section 10 |
| Sticky, transparent header that blurs after scroll | Navbar |
| Meaning as text colour or a thin outline, never a filled status pill | Activity, notifications, members |
| Motion 200 to 300ms, always respecting reduced motion | Section 6 |
| No em dashes, sentence case, caps for data labels only | Section 13 |
| Destructive actions in a confirm dialog that states what happens | Workspace, board and card deletion |
| Dark and light, with a theme switcher | `stores/theme.ts`, the account menu |

### Deliberate deviations

| ChaiUI | This app | Why |
|---|---|---|
| Background `#0a0a0a` | `rgb(0,0,0)` | A board is a large dark field with cards on it. A deeper base keeps columns and cards distinguishable without lifting every card. |
| Manrope everywhere, Montserrat for titles | Plus Jakarta Sans, JetBrains Mono for data | This UI works at 12 to 13px, where Jakarta holds its shape. Mono is needed for timestamps, counts and keycaps. |
| Theme switcher as a two-way toggle | Three modes, System, Light, Dark | The OS preference is a real choice, and a two-way toggle cannot express "follow it". |
| Instant theme change | A 2000ms iris out of the pressed control | The reveal is the one piece of theatre in an otherwise quiet product, and it is skipped entirely under reduced motion. |
| The chaicode background SVG behind the page | Not used | It is a marketing surface. Inside an app shell it competes with the content. |
| `max-w-6xl` with `p-6 sm:p-12` | `max-w-7xl` in the app, `max-w-6xl` on marketing | Board columns need the width. |
| `framer-motion` for hovers and reveals | CSS transitions and the View Transitions API | No animation library in the bundle. |
| shadcn `bg-primary` buttons on cards | Hairline outline buttons | Cards are dense. A grey fill reads as disabled next to them. |

### The check before shipping

- `npm run lint:colors` must be clean.
- Search the diff for em dashes and for saturated orange fills.
- Confirm no new filled status pill and no coloured card border.
- Confirm every new transition carries `motion-reduce:transition-none`.
- Look at the screen in both themes, at 1280 and at 375.
- If the ChaiUI docs already ship the component, compare before hand-rolling.

---

## 18. Known gaps

- CI does not run `npm run verify` or `npm test`, so type and lint errors reach review rather than blocking a push.
- `client` install cannot complete in a constrained sandbox, so `tsc -b`, `eslint` and `knip` are only run locally.
- Dead files remain with no importers: `CardDetailModal`, `CardAttachmentsDialog`, `CardCommentsDialog`, `DashboardBoardEmbed`, `RecentBoardsSection`, `RecentBoardsMenu`, `WorkspaceBoardCard`, `SidebarNewWorkspace`, `SidebarSelectMode`, `stores/useBoardStore.ts`, `types/models.ts`, `types/websocket.ts`.
- `--bg-surface`, `--bg-card` and `--bg-elevated` are still stepped values, so a panel that uses one reads as grey rather than black. Everything floating is on `--bg-root`; the steps are kept for cards and may be flattened.
- Arbitrary `shadow-[...]` utilities remain in marketing, and two are brand-tinted glows. They are the next cleanup, and they are deliberately outside `lint:colors`.
- `MobileSidebar` still carries two stale token classes.
