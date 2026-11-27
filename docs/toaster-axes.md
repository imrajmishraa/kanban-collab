# The toaster's API

Why `components/toaster/` looks the way it does, and what may change without
asking again. Design note for the change that replaced a flat list of twenty
props with seven axes (`docs/change-rules.md` §2, class C).

## The problem

`ToasterProps` had twenty props. `docs/change-rules.md` §3.3 caps a component at
eight and asks for a `variant`/`slot` split past that — so the answer to "make it
more advanced" could not be "add more booleans". Three of those twenty were
escape hatches onto the same element (`className`, `toastClassName`,
`bubbleClassName`), two described the same surface (`tone`, and the auth variant
that lived in the call layer), and four numbers existed in two places each.

## The shape

Seven props, every attribute inside one of them:

| Prop | Owns |
|---|---|
| `appearance` | shape, size, tone, fill, theme, icons, ink, description |
| `layout` | position, width, minWidth, mobileWidth, maxWidth, height, maxHeight, gap, offset, mobileOffset, expand, visibleToasts |
| `behaviour` | duration, closeButton, closeButtonShape, swipeDirections, hotkey |
| `animation` | enter, exit, duration, easing, respectReducedMotion |
| `progress` | visible, position, thickness, color, animated |
| `a11y` | containerLabel, toastLabel, closeLabel |
| `classNames` | sonner's own slot map, plus `toaster` for the root |
| `preset` | a whole configuration in one word |
| `id` | names the stack, so a second one can run beside it |

A new attribute is a field inside a group. That is what keeps the cap
satisfiable.

## One writer per fact

- **Surface** — `TONE_SURFACE` in `lib/toastTokens.ts`, and nowhere else. Eleven
  tones: `auto`, `brand`, `success`, `warning`, `danger`, `info`, `neutral`,
  `muted`, `auth`, `accent`, `inverse`. `auth` is a tone, not a variant with its
  own table; two writers of `--normal-bg` is how a brand toast and an auth toast
  could disagree silently. `info` and `muted` come from the tooltip's tone table;
  `accent` and `inverse` from the segmented control's `--accent-fill`/`--accent`
  pair and the tooltip's inverse family.
- **Strength** — `appearance.fill` is `solid` (the tone fills), `soft` (the tone
  tints and edges, the ink stays the page's) or `outline` (the tone is only the
  edge). The three are `button-solid`, `chip` and `button-danger` from
  `DESIGN.md`, and `toneSurface(tone, fill)` derives them from the one colour in
  `TONE_COLOR`, so a tone cannot be solid in one colour and soft in another.
- **Ink** — a tone sets three: `--normal-text`, `--toast-description`,
  `--toast-close`. A filled surface that leaves the description on
  `--text-muted` is a grey on a fill, and the status fills take
  `--inverse-text`, which is dark ink on a bright fill in one theme and the
  reverse in the other. White on the dark theme's `--success` is 1.9:1; the ink
  that flips with the token is 10.3:1.
- **Radius** — `SHAPE_CLASS`. `SURFACE` deliberately carries no
  `--border-radius`.
- **Lifetime** — `TOAST_MS`, read by the stack's default and by the per-kind
  overrides in `lib/toast.ts`.
- **Width** — `DEFAULT_WIDTH_PX` and `MOBILE_WIDTH_PX`, each in one place. The
  mobile cap travels as `--toast-mobile-width`, because a Tailwind class built
  by interpolation is never generated at build time.
- **Labels** — `a11y`. `toastLabel` is left unset by default on purpose: sonner
  prefers `customAriaLabel` over the stack label, so a default there would hide
  the hotkey hint from screen readers.

`lib/toastTokens.ts` lives in `lib/` because `lib/` may not import `components/`
(`change-rules.md` §4) and both halves need it.

## Two files, one API

`toasterTypes.ts` is the public shape and `toasterVariants.ts` is the tables; the
second re-exports the first, so a caller still imports both from one path. They
were one file until the pair crossed the 300-line budget for a `.ts` — types and
tables are two responsibilities, and the tables are the half that grows.

## What is deliberately absent

`interaction`, `responsive` and `sound` were proposed and are not here.

- **`interaction`** — sonner already pauses the timer on hover, on an expanded
  stack and on document blur; `swipeDirections` is the swipe; `dismissOnClick`
  and `dismissOnEscape` would mean owning the timer and the toast's click
  surface, which breaks text selection inside it. Three of its seven fields
  would be no-ops, and a no-op attribute is worse than an absent one. The one
  field that works — `preventDuplicate` — lives per toast, where it can.
- **`responsive`** — `layout.mobileWidth` plus sonner's own 600px breakpoint
  already cover the three cases the proposal lists.
- **`sound`** — no caller, and it needs audio assets and an autoplay policy of
  its own.
- **`icons.position` and `icons.animated`** — moving the glyph to the right means
  re-ordering three slots that sonner lays out itself, against a close button
  that is already `!order-last`; the doc lists both as "possible extensions to
  consider", and a slot order I cannot look at is not one to guess at.
- **`animation.stack`** — the note lists stack-transition control as a future
  capability; sonner owns how the stack fans out, so this is its decision first.

## Renamed since the first cut

Nothing here has shipped, so nothing is breaking. Two names moved while the API
was still being built, and both are recorded rather than aliased:

- `appearance.maxLines` → `appearance.description.lines`
- `behaviour.animation` → `animation` (its own group, because `enter` and `exit`
  are separate decisions)

## Where the arithmetic is

`toasterResolve.ts` — a pure function, no React and no sonner, so it is tested in
the node environment (`toasterResolve.test.ts`, 22 cases). `Toaster.tsx` builds
elements from its result and nothing else.

## Per toast, not per stack

A `Toaster` prop reaches every toast. `lib/toast.ts` reaches one: `tone` and
`fill`, `descriptionTone`, `icon`, `copyValue`, `id` (re-fire replaces instead of
stacking), `action`, `cancel`, `dismissible`, `closeButton`, `onDismiss`,
`onAutoClose`, `toasterId`, `testId`, plus `toastLoading` and `toastPromise` for
the two async shapes.

A component reaches all seven through one import — `const toast = useToast()`,
then `toast.success(...)` — from `hooks/useToast.ts`. That file holds no logic:
its signatures are `typeof` the library's functions, so a new option on
`toastSuccess` appears there for free, and the object is built once at module
scope so no component re-renders because of it. Services keep importing
`@/lib/toast` directly, because `hooks/` sits above them in the import matrix.

A component reaches all seven through one import — `const toast = useToast()`,
then `toast.success(...)` — from `hooks/useToast.ts`. That file holds no logic:
its signatures are `typeof` the library's functions, so a new option on
`toastSuccess` appears there for free, and the object is built once at module
scope so no component re-renders because of it. Services keep importing
`@/lib/toast` directly, because `hooks/` sits above them in the import matrix.

Four of those are the tooltip's attributes carried across: `descriptionTone` (a
warning line inside a neutral toast), `icon`, `copyValue` (sonner's action button,
so an explicit `action` wins), and `maxLines` on the stack.

`toastSuccess` and `toastError` keep their signatures. That is what kept this
change out of the 44 call sites.

## Not done here

- `AGENTS.md` cites `LAYOUT.md` four times; the file is not in the repo. Left
  alone: one concern per change.
- `client/scripts/design-doc.mjs` looks for tokens in `src/index.css`, where
  there are none — they are in `src/styles/tokens.css`, imported. The script
  exits 1 on a clean checkout, and CI does not run it.
- The close button is still 24px. Its glyph is the affordance and the target is
  small; a padded hit area would fix it without changing the design, and it is
  not in this change.
