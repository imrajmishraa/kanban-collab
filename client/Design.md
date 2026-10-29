# Design

How the kanban app looks, moves and is built. This is the reference for anyone adding a screen, a component or a route: the tokens, the layout rules, the interaction model, and the conventions the code already follows.

The visual language is **ChaiUI**, the chaicode.com design system. Sections 1 to 17 describe how this app applies it, including the parts it deliberately does not follow. Section 17 records that mapping rule by rule, so a future reader can tell a decision from a mistake.

The app is dark-only. There is no light theme to design for and no plan to add one, so every surface, border and text colour below assumes a near-black background.

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

---

## 2. Design tokens

Defined once in `client/src/index.css`. Never hardcode a hex value in a component.

### Surfaces

| Token | Value | Use |
|---|---|---|
| `--bg-root` | `#050505` | Page background, and the sidebar |
| `--bg-surface` | `rgb(27, 27, 28)` | Reserved; the sidebar no longer uses it |
| `--bg-card` | `#1c1c1e` | Cards, list rows |
| `--bg-elevated` | `rgb(44, 44, 46)` | Menus, popovers, dialogs |
| `--bg-hover` | `#28282c` | Hover fills |
| `--bg-active` | `#2e2e33` | Pressed fills |

The sidebar shares `--bg-root` with the page it sits beside. What separates them is a hairline (`border-r border-orange-50/10`), not a fill. A grey rail beside a black page reads as a separate product.

### Borders

| Token | Value |
|---|---|
| `--border` | `rgba(255,255,255,0.08)` |
| `--border-strong` | `rgba(255,255,255,0.14)` |
| `--border-subtle` | `rgba(255,255,255,0.05)` |

Newer components use the Tailwind arbitrary form instead, which is equivalent and easier to nudge per surface: `border-orange-50/[0.06]` at rest, `/15` for controls, `/20` for floating panels, `/30` on hover.

### Brand

| Token | Value |
|---|---|
| `--brand` | `#ff6b35` |
| `--brand-hover` | `#ff814f` |
| `--brand-active` | `#e95725` |
| `--brand-muted` | `rgba(255,107,53,0.1)` |
| `--brand-border` | `rgba(255,107,53,0.3)` |

### Text

`--text-primary #f5f5f5`, `--text-soft #cccccc`, `--text-secondary #a3a3a3`, `--text-muted #666666`, `--text-subtle #3f3f3f`.

In practice components use the `neutral-*` scale, which lands in the same range and has more steps: `text-neutral-100` for primary, `400` for body, `500` for secondary, `600` for meta, `700` for inert.

### Status

`--success #35d399`, `--warning #f5b84b`, `--danger #f16b7a`.

---

## 3. Orange is never a fill

This is the strictest rule in the system. Orange carries meaning, so it must not become decoration or a status chip.

Allowed:

- The logo.
- `hover:text-brand` on text links.
- The badge glint, and a 1.5px dot for unread.
- A 10% footer hairline.
- A segmented control's active fill, in dark brown rather than orange.
- Icon colour on an active row (`text-orange-100`), a text colour, not a fill.

Not allowed:

- Orange buttons, orange status pills, orange card borders, orange section headers, orange progress bars.

A primary action is **white on dark**. There is one per screen:

```tsx
className="rounded-none rounded-tr-lg rounded-bl-lg bg-white text-neutral-900"
```

Secondary actions are an outline with mirrored corners:

```tsx
className="rounded-none rounded-tr-lg rounded-bl-lg border border-orange-50/20"
```

Danger is a red fill, and only inside a confirm dialog.

---

## 4. Type

| Role | Family | Size and weight |
|---|---|---|
| UI text | Plus Jakarta Sans | 12.5px to 14px, 400 to 500 |
| Headings | Plus Jakarta Sans | 22px to 26px, 600, `tracking-tight` |
| Data labels, keys, timestamps | JetBrains Mono | 9px to 10px, uppercase, `tracking-[0.14em]` |

Both are loaded from Google Fonts in `client/index.html`. Body copy never uses the mono face; mono is reserved for numbers, keycaps and small labels where alignment or tabular figures matter.

Numbers that sit in columns get `tabular-nums`. Counts, times and member totals all use it so they do not jitter as values change.

---

## 5. Shape and depth

- Controls and rows: `rounded-lg`.
- Panels, popovers, dialogs: `rounded-xl`.
- Avatars and dots: full circle.
- Buttons: the asymmetric pair above, `rounded-none rounded-tr-lg rounded-bl-lg`, mirrored for secondary.

**No shadows on cards, panels or popovers.** Depth comes from a hairline border and a background one step lighter than the page. A shadow on a `#050505` background reads as grime, not elevation.

---

## 6. Motion

- Duration 150ms for colour and hover, 200ms for layout shifts, 300ms for overlays that grow or unroll.
- Animate `transform`, `opacity`, `width`, `max-height`, `border-radius`. Never animate `box-shadow` or `filter`.
- Every animation is wrapped for reduced motion: `motion-reduce:transition-none`.
- Menus appear by opacity and a 2px translate, not by scale. Scaling text looks like a zoom bug.

---

## 7. Layout

```
+--------------+------------------------------------------+
|              |  navbar 56px, fixed, blurred on scroll   |
|  sidebar     +------------------------------------------+
|  256px       |                                          |
|  (64px       |  page content                            |
|   collapsed) |  max-w-7xl, px-5 sm:px-6 lg:px-8, py-6   |
|              |                                          |
+--------------+------------------------------------------+
```

- Sidebar: `w-64` expanded, `w-16` collapsed, `transition-[width] duration-200`.
- Navbar: `h-14`, `fixed top-0 right-0`, offset `left-64` or `left-16` to match the rail, `z-50`.
- Main: `ml-64` or `ml-16`, `h-screen`, `overflow-y-auto`.
- Page frame: `BoardShell` gives every in-app page the same width and padding, so a new page inherits the grid without deciding anything.
- Marketing pages use `max-w-6xl` and are exempt from the app shell.

Mobile is a separate composition: the rail becomes a drawer (`MobileSidebar`, `w-72`, `z-50`), the navbar is replaced by a compact header, and the page keeps its own scroll.

---

## 8. Shell anatomy

### Sidebar

Top to bottom: brand and collapse control, **Find** (`F`), primary navigation, the workspace's board list, then the account footer.

Navigation, in order:

1. `Projects` to `/dashboard` when no workspace is selected, `Overview` to `/workspaces/:id` when one is. The icon slot shows the workspace's avatar if it has one, otherwise the Projects glyph.
2. `Boards`, `Notes`, `Members`.
3. A hairline.
4. `Activity` and `Settings`, both drilldowns.

A drilldown row has a right chevron. Clicking it replaces the navigation list with that section's own pages, headed by a back arrow and a centred title. It is a panel inside the sidebar, not a modal and not an inline accordion. Grouped children can carry an uppercase section label.

The board list is a collapsible group with a chevron that rotates 90 degrees while open. Pinned boards survive a reload.

### Footer

Avatar, name, then two round controls: a three-dots account menu and a bell. Both open upward as popovers. The bell carries a cream dot when unread, and its `aria-label` includes the count so the state is not colour-only.

### Navbar

Left: a breadcrumb of grid icon, workspace switcher, and (on board routes only) a second chevron with the board switcher. Centre: the page title, `pointer-events-none`. Right: search, then notifications.

With no workspace selected, the switcher collapses to a single "All Workspaces" pill on every route, not just the dashboard. An empty breadcrumb beside a page asking you to pick a workspace is worse than no breadcrumb.

---

## 9. Routes

| Path | Screen | Gate |
|---|---|---|
| `/`, `/features`, `/how-it-works` | Marketing | public |
| `/auth/login`, `/auth/register`, `/auth/forgot-password` | Auth | guest only |
| `/auth/callback` | OAuth return | public |
| `/dashboard` | Projects overview | authenticated |
| `/workspaces/:workspaceId` | One workspace | authenticated |
| `/boards` | Board list | `RequireWorkspace` |
| `/boards/:boardId` | Board canvas | authenticated, board carries its workspace |
| `/notes`, `/members`, `/activity` | Workspace pages | `RequireWorkspace` |
| `/user/profile`, `/settings` | Account | authenticated |

`RequireWorkspace` renders a picker in place when nothing is selected: the destination's name, a search field, the workspace list, and a create button. It does not redirect and it is not a lock.

---

## 10. Components

### Board canvas

Columns scroll horizontally, each with a header, a count, a card list and a composer. Cards show title, labels, assignee avatars, comment and attachment counts, and a cover image when set. Dragging reorders within and across columns, and the order is persisted through Yjs so two people dragging at once converge.

### Card palette

`⌘I` or `⌘K` on a board opens the card palette: a single command surface for the board, with the card's fields, comments and attachments. Clicking a card opens it rather than a separate modal, so there is one editing surface, not two.

### Avatars

`Avatar` resolves its own name and image from `useActiveWorkspaceMembers`, so a caller passes an id and gets the right face without threading data. Initials are the fallback, tinted by a deterministic colour from the id. Workspace avatars come from `avatarUrl` with the same fallback.

### Notifications

Two surfaces over one query: the navbar sheet (full height, tabs, mark read, clear, mute) and the footer popover (Inbox / Unread / Comments, search, filter). Both read `notificationsApi.listNotifications` under one query key, so they cannot disagree.

### Activity

`/activity` is a cursor-paginated feed grouped by day, with filter chips that live in the URL (`?type=comments`), so a filtered view can be linked and survives a reload. Day headers are derived by comparing each row with the one above, never by mutating a variable during render.

---

## 11. Keyboard

| Key | Action | Scope |
|---|---|---|
| `F` | Open Find | Anywhere outside a text field |
| `N` | Open notifications | Anywhere outside a text field |
| `⌘K` / `Ctrl+K` | Search palette | Everywhere except board routes |
| `⌘I` or `⌘K` | Card palette | Board routes |
| `⌘⇧K` | New project | Sidebar |
| `Enter` | Submit composer or comment | Text fields |
| `Shift+Enter` | Newline | Text fields |
| `Esc` | Close the top overlay | Overlays |

Every global handler ignores events while the caret is in an `input`, `textarea`, `select` or contentEditable element, and ignores modified keys. Typing a name must never open a panel.

---

## 12. States

Every data surface answers four questions:

1. **Loading.** Skeletons shaped like the real content, never a spinner in the middle of an empty box. `DashboardSkeleton` mirrors the actual tile and row layout so nothing jumps when data lands.
2. **Empty.** An icon in a hairline circle, one sentence, and an action if there is an obvious one. "Nothing has happened yet", not "No data".
3. **Error.** What failed, in plain words, and a retry. `BoardError` is the shared shape.
4. **Partial.** Infinite lists show a "Loading more" row with a spinner, and "End of activity" when the cursor runs out.

Realtime surfaces also show who else is present, and reconcile after a reconnect rather than silently diverging.

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

- Icon-only controls carry `aria-label`. Controls with visible text do not get a tooltip.
- Tooltips appear only on icon-only controls, and the label matches the `aria-label`.
- Toggle state uses `aria-expanded` or `aria-pressed`, not colour alone.
- Hidden but mounted panels get `inert` and `aria-hidden`, so nothing offscreen is tabbable.
- Focus rings are removed only where a control has a stronger visual focus state. Never remove focus indication from a link or a text field without replacing it.
- Decorative icons and dividers are `aria-hidden="true"`.
- Contrast targets 4.5:1 for body text. `neutral-600` is for meta text only, never for a control label.

---

## 15. Code conventions

```
client/src/
  app/          router, layouts, providers, route guards
  features/     one folder per domain: boards, workspaces, notes, activity, settings
  components/   layout/ (composition), ui/ (primitives), Tooltips/
  hooks/        dashboard and auth hooks
  stores/       Zustand stores
  api/          one module per resource, typed
  types/        API and domain types
  validations/  zod schemas shared with the server
```

- Aliases: `@/` for `src`, `@components/` for `src/components`.
- API modules return unwrapped payloads: `response.data.data`, so callers never touch the envelope.
- One query key object per resource (`notificationKeys.all`), invalidated after mutations.
- Stores hold what survives a navigation; query cache holds what the server owns.
- Tailwind only. No CSS modules, no styled components, no inline style objects except for values that must be computed (a width from a measurement, a colour from an id).

### React Compiler rules this codebase has been bitten by

These all pass `tsc`, so the compiler is the gate, not the type checker:

- **No mutation during render.** Derive, do not accumulate. A `let lastDay` reassigned inside `.map()` is rejected; compare with the previous item instead.
- **Declare state above the callbacks that use it.** A setter read before its `const [x, setX]` declaration fails even inside a closure.
- **No `window` reads during render.** Use `useLocation()`, not `window.location.pathname`, or the value is captured once and never updates.
- **Effects that write state must not fight the URL.** A page that syncs a store from its route needs a "already synced this route" guard, or clearing that store is undone on the next render.

---

## 16. Do and don't

| Do | Don't |
|---|---|
| Hairline borders for separation | Shadows on panels |
| White primary button, one per screen | Orange filled buttons |
| `bg-(--bg-root)` for page and rail, hairline between | A grey rail beside a black page |
| Derive values during render | Mutate a variable inside `.map()` |
| `aria-label` on icon buttons, tooltip to match | Tooltip on a control that already has text |
| `motion-reduce:transition-none` on every transition | Unconditional animation |
| Sentence case, no em dash | Title Case, em dash |
| Skeleton shaped like the content | Spinner in an empty box |
| One editing surface per card | A modal and a palette for the same card |

---

## 17. ChaiUI alignment

The design language is ChaiUI, the chaicode.com look. Its own description: neutral near-black, white type, one quiet cream accent, warm hairlines, and orange almost nowhere. Premium comes from restraint.

Sources, in priority order:

1. `https://ui.chaicode.com/.well-known/skills/chaiui/SKILL.md` for the rules.
2. `https://ui.chaicode.com/llms.txt` for the component index.
3. The live docs, which show every component in both themes with its code.

When a detail is not covered, read those. Do not infer a rule from a screenshot.

### Which mode this project uses

ChaiUI offers three ways in: install shipped components through its shadcn registry, hand-build from its recipes on Tailwind v4, or follow the Tailwind 3 guide.

This project uses the second. There is no shadcn and no `components.json` here, so `npx shadcn add @chaiui/...` does not apply. Tokens live in `client/src/index.css` and every component is hand-built. If shadcn is ever added, the registry route becomes available and shipped components should be preferred over hand-rolling.

### Adopted without change

| ChaiUI rule | Where it shows up |
|---|---|
| Orange is never a fill, with the same allow-list | Section 3, the white primary button |
| Cream as the accent, one highlighted phrase per paragraph | `text-orange-100` spans, active icons |
| Warm hairlines, no shadow on cards or panels | Every surface |
| Solid button corners `rounded-none rounded-tr-lg rounded-bl-lg`, one per screen | Section 3 |
| Outline button with mirrored corners | Secondary actions |
| Sticky, transparent header that blurs only after scroll | Navbar `scrolled ? bg-(--bg-root)/85 backdrop-blur-md` |
| Meaning as text colour or a thin outline, never filled status pills | Activity, notifications, member counts |
| Motion 200 to 300ms, always respecting `prefers-reduced-motion` | Section 6 |
| No em dashes, sentence case, caps only for data labels | Section 13 |
| Destructive actions in a confirm dialog that states exactly what happens | Workspace, board and card deletion |

### Deliberate deviations

Each of these is a decision, not an oversight.

| ChaiUI | This app | Why |
|---|---|---|
| Background `#0a0a0a` | `#050505` | A board is a large dark field with cards on it. A deeper base keeps columns and cards distinguishable without lifting every card's lightness. |
| Manrope everywhere, Montserrat for titles, Onest wordmark | Plus Jakarta Sans, JetBrains Mono for data | This UI works at 12 to 13px, where Jakarta holds its shape better. Mono is needed for timestamps, counts and keycaps, which ChaiUI does not have. |
| Dark and light, with a theme switcher | Dark only, no switcher | The product has one theme. A switcher would ship a light surface nobody tested. |
| The chaicode background SVG behind the page | Not used | It is a marketing surface. Inside an app shell it competes with the content it is meant to frame. |
| One width, `max-w-6xl` with `p-6 sm:p-12` | `max-w-7xl` with `px-5 sm:px-6 lg:px-8 py-6` in the app, `max-w-6xl` on marketing | Board columns need the extra width. Marketing pages keep the skill's width. |
| `framer-motion` for hovers and reveals | CSS transitions only | No animation library in the bundle. Everything here animates width, opacity or max-height, which CSS handles. |
| shadcn `bg-primary` buttons on cards | Hairline outline buttons | Cards are dense here. A grey fill reads as disabled next to them. |
| Highlight phrase in Montserrat, capitalised | Highlight in the body face | Same one-phrase-per-paragraph discipline, without a third typeface. |

### The check before shipping

Adapted from the skill's own closing checklist:

- Search the diff for em dashes, and for saturated orange fills: `bg-orange-500`, `bg-orange-600`, `#FF7D0C`. The `orange-50` hairlines and `orange-100` cream accents are expected and are not what this catches.
- Confirm no new filled status pill and no coloured card border slipped in.
- Confirm every new transition carries `motion-reduce:transition-none`.
- Check phone width for sideways scroll.
- If the ChaiUI docs already ship the component, compare against it before hand-rolling.

---

## 18. Known gaps

Honest list of what this document cannot promise yet:

- CI does not run `npm run verify` or `npm test`, so type and lint errors reach review rather than blocking a push.
- `client` install cannot complete in a constrained sandbox, so `tsc -b`, `eslint` and `knip` are only ever run locally or on a full machine.
- Dead files remain in the tree with no importers: `CardDetailModal`, `CardAttachmentsDialog`, `CardCommentsDialog`, `DashboardBoardEmbed`, `RecentBoardsSection`, `RecentBoardsMenu`, `WorkspaceBoardCard`, `SidebarNewWorkspace`, `stores/theme.ts`, `stores/useBoardStore.ts`, `types/models.ts`, `types/websocket.ts`.
- `MobileSidebar` still carries two stale token classes.
- The `.dark` token block exists but the app never toggles it.
