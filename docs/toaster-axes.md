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
| `appearance` | shape, size, tone, theme, icons |
| `layout` | position, width, mobileWidth, maxWidth, height, maxHeight, gap, offset, mobileOffset, expand, visibleToasts |
| `behaviour` | duration, closeButton, closeButtonShape, swipeDirections, hotkey |
| `a11y` | containerLabel, toastLabel, closeLabel |
| `classNames` | sonner's own slot map, plus `toaster` for the root |
| `preset` | a whole configuration in one word |
| `id` | names the stack, so a second one can run beside it |

A new attribute is a field inside a group. That is what keeps the cap
satisfiable.

## One writer per fact

- **Surface** — `TONE_SURFACE` in `lib/toastTokens.ts`, and nowhere else. `auth`
  is a tone, not a variant with its own table. Two writers of `--normal-bg` is
  how a brand toast and an auth toast could disagree silently.
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

## Where the arithmetic is

`toasterResolve.ts` — a pure function, no React and no sonner, so it is tested in
the node environment (`toasterResolve.test.ts`, 22 cases). `Toaster.tsx` builds
elements from its result and nothing else.

## Per toast, not per stack

A `Toaster` prop reaches every toast. `lib/toast.ts` reaches one: `tone`, `id`
(re-fire replaces instead of stacking), `action`, `cancel`, `dismissible`,
`closeButton`, `onDismiss`, `onAutoClose`, `toasterId`, `testId`, plus
`toastLoading` and `toastPromise` for the two async shapes.

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
