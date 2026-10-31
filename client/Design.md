---
version: alpha
name: Kanban Collab
description: A dense, two-theme work surface for real-time collaborative Kanban boards. Colour is information, never decoration; depth comes from a hairline; one accent, spent carefully.
themes:
  default: dark
  alternate: light
  switch: '.light on <html>'
colors:
  bg-root: 'rgb(0, 0, 0)'
  bg-surface: 'rgb(20, 20, 21)'
  bg-card: 'rgb(26, 26, 28)'
  bg-elevated: 'rgb(36, 36, 38)'
  bg-hover: 'rgba(255, 255, 255, 0.05)'
  bg-active: 'rgba(255, 255, 255, 0.08)'
  tint-2: 'rgba(255, 255, 255, 0.02)'
  tint-3: 'rgba(255, 255, 255, 0.03)'
  tint-4: 'rgba(255, 255, 255, 0.04)'
  tint-5: 'rgba(255, 255, 255, 0.05)'
  tint-6: 'rgba(255, 255, 255, 0.06)'
  tint-8: 'rgba(255, 255, 255, 0.08)'
  tint-10: 'rgba(255, 255, 255, 0.1)'
  tint-15: 'rgba(255, 255, 255, 0.15)'
  border: 'rgba(255, 255, 255, 0.1)'
  border-strong: 'rgba(255, 255, 255, 0.16)'
  border-subtle: 'rgba(255, 255, 255, 0.06)'
  hairline: 'rgba(255, 245, 235, 0.1)'
  hairline-strong: 'rgba(255, 245, 235, 0.18)'
  accent: 'rgb(255, 224, 178)'
  accent-soft: 'rgba(255, 224, 178, 0.14)'
  accent-fill: 'rgba(124, 45, 18, 0.4)'
  brand: '#ff6b35'
  brand-hover: '#ff814f'
  brand-active: '#e95725'
  brand-muted: 'rgba(255, 107, 53, 0.1)'
  brand-border: 'rgba(255, 107, 53, 0.3)'
  text-primary: 'rgb(245, 245, 245)'
  text-soft: 'rgb(204, 204, 204)'
  text-secondary: 'rgb(163, 163, 163)'
  text-muted: 'rgb(120, 120, 120)'
  text-subtle: 'rgb(72, 72, 72)'
  solid-bg: 'rgb(255, 255, 255)'
  solid-bg-hover: 'rgb(229, 229, 229)'
  solid-text: 'rgb(10, 10, 10)'
  on-color: 'rgb(10, 10, 10)'
  inverse-bg: 'rgb(245, 245, 245)'
  inverse-text: 'rgb(10, 10, 10)'
  inverse-border: 'rgba(0, 0, 0, 0.12)'
  inverse-accent: 'rgb(146, 64, 14)'
  glass: 'rgba(13, 13, 13, 0.72)'
  scrim: 'rgba(0, 0, 0, 0.55)'
  scrollbar-thumb: '#292929'
  scrollbar-thumb-hover: '#3a3a3a'
  success: '#35d399'
  warning: '#f5b84b'
  danger: '#f16b7a'
light:
  bg-root: 'rgb(250, 250, 250)'
  bg-surface: 'rgb(255, 255, 255)'
  bg-card: 'rgb(255, 255, 255)'
  bg-elevated: 'rgb(255, 255, 255)'
  bg-hover: 'rgba(0, 0, 0, 0.04)'
  bg-active: 'rgba(0, 0, 0, 0.06)'
  tint-2: 'rgba(0, 0, 0, 0.02)'
  tint-3: 'rgba(0, 0, 0, 0.025)'
  tint-4: 'rgba(0, 0, 0, 0.03)'
  tint-5: 'rgba(0, 0, 0, 0.035)'
  tint-6: 'rgba(0, 0, 0, 0.045)'
  tint-8: 'rgba(0, 0, 0, 0.06)'
  tint-10: 'rgba(0, 0, 0, 0.08)'
  tint-15: 'rgba(0, 0, 0, 0.12)'
  border: 'rgba(0, 0, 0, 0.1)'
  border-strong: 'rgba(0, 0, 0, 0.18)'
  border-subtle: 'rgba(0, 0, 0, 0.06)'
  hairline: 'rgba(60, 30, 10, 0.12)'
  hairline-strong: 'rgba(60, 30, 10, 0.22)'
  accent: 'rgb(146, 64, 14)'
  accent-soft: 'rgba(146, 64, 14, 0.1)'
  accent-fill: 'rgba(146, 64, 14, 0.16)'
  brand: '#c2410c'
  brand-hover: '#9a3412'
  brand-active: '#7c2d12'
  brand-muted: 'rgba(194, 65, 12, 0.1)'
  brand-border: 'rgba(194, 65, 12, 0.32)'
  text-primary: 'rgb(17, 17, 17)'
  text-soft: 'rgb(56, 56, 56)'
  text-secondary: 'rgb(90, 90, 90)'
  text-muted: 'rgb(120, 120, 120)'
  text-subtle: 'rgb(165, 165, 165)'
  solid-bg: 'rgb(10, 10, 10)'
  solid-bg-hover: 'rgb(38, 38, 38)'
  solid-text: 'rgb(250, 250, 250)'
  inverse-bg: 'rgb(17, 17, 17)'
  inverse-text: 'rgb(250, 250, 250)'
  inverse-border: 'rgba(255, 255, 255, 0.14)'
  inverse-accent: 'rgb(255, 224, 178)'
  glass: 'rgba(255, 255, 255, 0.72)'
  scrim: 'rgba(0, 0, 0, 0.35)'
  on-color: 'rgb(10, 10, 10)'
  scrollbar-thumb: '#d4d4d4'
  scrollbar-thumb-hover: '#b4b4b4'
  success: '#047857'
  warning: '#a16207'
  danger: '#be123c'
typography:
  font-ui:
    fontFamily: "'Plus Jakarta Sans Variable', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
  font-mono:
    fontFamily: "'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, monospace"
  display-lg:
    fontFamily: '{typography.font-ui.fontFamily}'
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: '-0.02em'
  headline-lg:
    fontFamily: '{typography.font-ui.fontFamily}'
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: '-0.02em'
  headline-md:
    fontFamily: '{typography.font-ui.fontFamily}'
    fontSize: 19px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: '-0.01em'
  title-lg:
    fontFamily: '{typography.font-ui.fontFamily}'
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 22px
  title-md:
    fontFamily: '{typography.font-ui.fontFamily}'
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 20px
  body-lg:
    fontFamily: '{typography.font-ui.fontFamily}'
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: '{typography.font-ui.fontFamily}'
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: '{typography.font-ui.fontFamily}'
    fontSize: 12.5px
    fontWeight: '400'
    lineHeight: 18px
  label-mono:
    fontFamily: '{typography.font-mono.fontFamily}'
    fontSize: 9px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: '0.14em'
    textTransform: uppercase
rounded:
  none: 0px
  sm: 4px
  md: 6px
  lg: 8px
  xl: 12px
  2xl: 16px
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  2xl: 32px
  control-height: 36px
  row-height: 32px
  icon-button: 32px
  rail-width: 256px
  rail-collapsed: 72px
  navbar-height: 56px
motion:
  duration-fast: 150ms
  duration-base: 200ms
  duration-slow: 300ms
  ease-standard: ease
  ease-out: ease-out
  reveal-grow: 1200ms
  reveal-collapse: 900ms
  reveal-curve-grow: 'cubic-bezier(0.22, 1, 0.36, 1)'
  reveal-curve-collapse: 'cubic-bezier(0.6, 0, 0.4, 1)'
components:
  button-solid:
    backgroundColor: '{colors.solid-bg}'
    textColor: '{colors.solid-text}'
    typography: '{typography.body-lg}'
    rounded: '0px 8px 0px 8px'
    height: 36px
    padding: 0 16px
  button-solid-hover:
    backgroundColor: '{colors.solid-bg-hover}'
  button-outline:
    backgroundColor: transparent
    textColor: '{colors.text-soft}'
    typography: '{typography.body-lg}'
    rounded: '8px 0px 8px 0px'
    height: 36px
    padding: 0 16px
    borderColor: '{colors.hairline-strong}'
  button-ghost:
    backgroundColor: transparent
    textColor: '{colors.text-secondary}'
    typography: '{typography.body-md}'
    rounded: '{rounded.lg}'
    height: 32px
    padding: 0 10px
  button-ghost-hover:
    backgroundColor: '{colors.tint-4}'
    textColor: '{colors.text-primary}'
  button-danger:
    backgroundColor: transparent
    textColor: '{colors.danger}'
    typography: '{typography.body-lg}'
    rounded: '{rounded.lg}'
    height: 36px
    padding: 0 16px
    borderColor: '{colors.danger}'
  icon-button:
    backgroundColor: transparent
    textColor: '{colors.text-muted}'
    rounded: '{rounded.lg}'
    width: 32px
    height: 32px
  icon-button-hover:
    backgroundColor: '{colors.tint-4}'
    textColor: '{colors.text-primary}'
  theme-swatch-active:
    backgroundColor: '{colors.tint-10}'
    textColor: '{colors.accent}'
    rounded: '{rounded.full}'
    width: 24px
    height: 24px
  segmented-control:
    backgroundColor: '{colors.tint-3}'
    textColor: '{colors.text-secondary}'
    rounded: '{rounded.full}'
    borderColor: '{colors.hairline}'
    padding: 2px
  segmented-active:
    backgroundColor: '{colors.accent-fill}'
    textColor: '{colors.accent}'
    typography: '{typography.body-sm}'
  chip:
    backgroundColor: '{colors.tint-4}'
    textColor: '{colors.text-soft}'
    typography: '{typography.label-mono}'
    rounded: '{rounded.full}'
    borderColor: '{colors.hairline}'
    padding: 2px 10px
  input-field:
    backgroundColor: transparent
    textColor: '{colors.text-primary}'
    typography: '{typography.body-lg}'
    rounded: '{rounded.lg}'
    height: 36px
    padding: 0 12px
    borderColor: '{colors.hairline}'
  input-field-focus:
    borderColor: '{colors.hairline-strong}'
  input-placeholder:
    textColor: '{colors.text-subtle}'
  card:
    backgroundColor: '{colors.bg-card}'
    textColor: '{colors.text-primary}'
    rounded: '{rounded.lg}'
    padding: 12px
    borderColor: '{colors.hairline}'
  popover:
    backgroundColor: '{colors.bg-root}'
    textColor: '{colors.text-soft}'
    rounded: '{rounded.xl}'
    padding: 4px
    borderColor: '{colors.hairline-strong}'
  menu-item:
    backgroundColor: transparent
    textColor: '{colors.text-soft}'
    typography: '{typography.body-sm}'
    rounded: '{rounded.md}'
    height: 32px
    padding: 0 10px
  menu-item-hover:
    backgroundColor: '{colors.tint-4}'
    textColor: '{colors.text-primary}'
  dialog:
    backgroundColor: '{colors.bg-root}'
    textColor: '{colors.text-primary}'
    rounded: '{rounded.2xl}'
    padding: 24px
    borderColor: '{colors.hairline}'
    width: 448px
  dialog-backdrop:
    backgroundColor: '{colors.scrim}'
    blur: 4px
  tooltip:
    backgroundColor: '{colors.inverse-bg}'
    textColor: '{colors.inverse-text}'
    typography: '{typography.body-sm}'
    rounded: '{rounded.md}'
    borderColor: '{colors.inverse-border}'
    padding: 4px 8px
  avatar:
    backgroundColor: '{colors.tint-8}'
    textColor: '{colors.on-color}'
    rounded: '{rounded.full}'
    size: 24px
  navbar:
    backgroundColor: '{colors.glass}'
    textColor: '{colors.text-primary}'
    height: 56px
    blur: 12px
  rail:
    backgroundColor: '{colors.bg-root}'
    textColor: '{colors.text-soft}'
    width: 256px
    borderColor: '{colors.hairline}'
  toast:
    backgroundColor: '{colors.bg-root}'
    textColor: '{colors.text-primary}'
    typography: '{typography.body-sm}'
    rounded: '{rounded.xl}'
    padding: 12px 16px
    borderColor: '{colors.hairline-strong}'
  skeleton:
    backgroundColor: '{colors.tint-6}'
    rounded: '{rounded.md}'
---

## Overview

This document describes the visual language of the Kanban Collab client: a dense, two-theme work surface for boards that several people edit at the same time. It follows the shape of the [Ant Design DESIGN.md](https://github.com/ant-design/ant-design/blob/master/DESIGN.md) — tokens first, in machine-readable front matter, then the reasoning behind them — because a token list without the rules that govern it is a palette, not a system.

The product is an operational tool, not a marketing site. A user lives in it for hours: columns of cards, a rail of boards, a panel of live activity, cursors moving in real time. That context sets the whole visual language. Every decision below favours density, calm and legibility over expressiveness, and the two themes are first-class — a team can switch mid-session without the interface losing its meaning.

Dark is the default and lives on `:root`; light overrides it under `.light`. There is no `.dark` block, so each token has exactly one definition per theme. `npm run lint:colors` fails the build if a component hardcodes a colour instead of asking for a token.

## Values

Four values generate the rest of this document. When a case is not covered below, resolve it with these.

**Quiet surfaces.** The page is the page. Black in dark, paper in light, and nothing in between that is decorative. A panel, a row, a chip or a bar is a surface or a wash — never a colour. Meaning travels in ink, not in fills, so a board's identity colour appears as text and a hairline edge rather than a coloured block. A screen full of tinted panels reads as noise; a screen of hairlines reads as structure.

**One accent, spent carefully.** Orange is the brand, and it is 2.72:1 on the light page, so it cannot carry text there. It therefore exists as a *fill* for identity discs and as `--brand` text only where the contrast allows — and in light the token swaps to a deep amber that can. The cream accent (`--accent`) is the one highlight that works on black; in light it becomes the same deep amber. Nothing else in the system is allowed to be a colour.

**Depth is a hairline.** No shadows on cards, panels, popovers or menus. Separation comes from a one-pixel warm edge (`--hairline`) and, at most, one step of lightness. A shadow on a black page reads as grime, and a stack of soft shadows reads as a mockup rather than an application.

**Small type, tight tracking.** Interface text runs 12.5–14px at 400–500 weight, headings 19–26px at 600–700 with negative tracking. Numbers, keycaps and micro-labels use the mono face at 9–10px, uppercase, widely tracked. This is a deliberate density choice: it fits a column of cards and a rail of boards on one screen without scrolling, which is the whole point of a board view.

## Colour

Two axes, and they never mix.

**Surfaces** are a ladder: `--bg-root` is the page and also every floating surface, then `--bg-surface`, `--bg-card`, `--bg-elevated` for panels that must lift. In dark the ladder climbs from pure black; in light the top three collapse to white and separation is carried entirely by hairlines. That is why no component may assume a background differs from its parent — the edge is the guarantee, not the fill.

**Washes** are one scale, `--tint-2` through `--tint-15`, defined as white in dark and black in light. A component asks for a strength (`hover` is `--tint-4`, a pressed state `--tint-6`, a selected row `--tint-10`) and the theme decides the direction. This is the mechanism that makes one class string work in both themes.

Two colours escape the system by design, and each has a written reason. The **hairline** is warm (`rgba(255,245,235,…)`) rather than neutral, so panels read as paper edges rather than as grid lines; it is not a brand colour, which is why it has its own token and its own value per theme. The **inverse** family exists for the tooltip, which flips: a light capsule on a dark page, a dark one on a light page, with `--inverse-accent` for the highlighted phrase so it does not vanish into the capsule.

Status colour (`--success`, `--warning`, `--danger`) is text and border only. A failed field is a `--danger` edge and a `--danger` message underneath — never a red-filled input.

## Typography

Plus Jakarta Sans carries the interface; JetBrains Mono is reserved for numbers, keys, timestamps and micro-labels where alignment matters. Both ship as dependencies (`@fontsource-variable/*`, imported in `main.tsx`) and are bound to `font-sans` and `font-mono` by the `@theme` block in `index.css` — so no font is fetched from a CDN, and a component that writes `font-mono` gets the mono face rather than the browser's default. Body copy never uses the mono face. Numeric columns get `tabular-nums` so a live counter does not shuffle sideways as it counts.

The scale is deliberately short — five UI sizes and one mono size. A screen that needs a sixth is usually a screen that needs fewer things on it. Headings are tight (`-0.01em` to `-0.02em`) because at 19–26px the default spacing looks loose beside 12.5px body text.

## Shape

Radius encodes what a thing is, not how big it is:

- Controls, rows, fields, cards: `rounded-lg` (8px).
- Panels, popovers, menus, toasts: `rounded-xl` (12px).
- Dialogs: `rounded-2xl` (16px).
- Avatars, dots, chips, segmented controls: full circle.
- Primary and secondary buttons: an asymmetric cut — `rounded-none rounded-tr-lg rounded-bl-lg`, mirrored for the outline variant. It is the one decorative gesture in the system, and it appears exactly twice.

## Motion

Motion answers a question or it does not ship. Colour, hover and focus transitions run 150ms on `ease`; layout shifts and widths 200ms on `ease-out`; menus and popovers 150–200ms as opacity plus a 2px translate. Nothing scales on entry — scaled text reads as a zoom bug.

Animate `transform`, `opacity`, `width`, `max-height` and `clip-path`. Never animate `box-shadow`. Every transition carries `motion-reduce:transition-none`, and the whole system degrades to instant under `prefers-reduced-motion`.

The one piece of choreography is the **theme reveal**: the class flip is wrapped in a View Transition and the snapshot is clipped to a circle centred on the control that was pressed. Going light, the new frame opens out of the button over 1200ms on `cubic-bezier(0.22, 1, 0.36, 1)`; going dark, the old frame closes back into it over 900ms on `cubic-bezier(0.6, 0, 0.4, 1)`. Both start and end at the button's own radius, so the two directions mirror each other. Two rules keep it honest: the origin is published as `--vt-x`, `--vt-y` and `--vt-seed` *before* the transition starts, so the incoming frame is already clipped on its first paint and the page never flashes whole; and a reveal that is still running is torn down rather than stacked, so a second press never leaves two irises fighting over the same snapshot. With no View Transitions support, or reduced motion, the theme changes with no animation at all.

## Layout

A fixed rail on the left (256px, or 72px collapsed), a 56px navbar that blurs as content scrolls beneath it, and one scrolling content column. The rail is the page colour, separated by a hairline — it is not a panel. Below `md` the rail becomes a sheet and the navbar keeps the menu affordance; nothing else in the layout changes.

Content max-widths are per-route rather than global: a board is as wide as the viewport because columns are the unit of work, while settings and marketing pages cap at a reading width.

## Components

The recipes in the front matter are the contract. A few rules sit behind them.

**One solid button per screen.** The solid variant is the primary action and nothing else; beside it sits an outline, and everything else is ghost. A toolbar of three solid buttons has no primary action.

**Every icon-only control carries `aria-label` plus a tooltip with the same string.** The tooltip is not decoration; it is the label made visible.

**Floating surfaces are the page colour.** Popovers, menus, dialogs and toasts sit on `--bg-root` and are separated by a hairline. `--bg-elevated` exists but is not used for them: a grey panel on a black page reads as a different material rather than a layer.

**Fields do not glow.** Focus firms the hairline from `--hairline` to `--hairline-strong` and nothing else — no orange halo, no ring. A label sits above at `text-sm font-medium`, a hint below at 11px muted, and an error replaces the hint in `--danger` with a `--danger` edge on the field.

**The active segment is the only filled control.** In a segmented control the selected option takes `--accent-fill` with `--accent` text — dark brown with cream, never orange.

**Chips keep their colour as text.** A label chip is a neutral `--tint-4` fill, a hairline edge, mono uppercase text. The card's identity colour is the text colour, not the background.

## Accessibility

Measured against the page they sit on, in each theme:

| Token | Dark on black | Light on 250 | Use |
|---|---|---|---|
| `--text-primary` | 19.3:1 | 18.1:1 | Body and headings |
| `--text-soft` | 8.3:1 | 6.6:1 | Secondary body |
| `--text-muted` | 4.76:1 | **4.23:1** | Meta text only — see below |
| `--text-subtle` | 2.30:1 | 2.36:1 | Placeholders and disabled only |
| `--accent` | 16.6:1 | 6.8:1 | Highlight phrase |
| `--brand` | — | 2.72:1 | Never text in light; the token swaps to `#c2410c` at 4.96:1 |

One known gap, stated plainly rather than glossed: **`--text-muted` misses AA in light at 4.23:1** (it passes in dark at 4.76:1). It is therefore safe for timestamps, counts and labels beside a stronger element, and not safe for a sentence a user has to read. Closing it means `rgb(115)` in the light block — 4.54:1 — which is a token change, not a component change, and the only reason it is still open is that it shifts the light theme's quiet grey a shade darker everywhere at once.

Focus is visible on every interactive element through a global `:focus-visible` ring, except fields, which use the border change described above. Dialogs trap focus, close on Escape and on a backdrop press, and restore focus to the trigger. Live regions announce board changes; the activity feed is a `log`, not a list.

## Adding to the system

A new component is added by writing its recipe into the front matter of this file first, then the component. If a value cannot be expressed with an existing token, the answer is a new token in `index.css` with a value in both themes — not a colour literal in a `className`. `npm run lint:colors` enforces the last part; the rest is review.

When this document and the code disagree, the code is right and this file is a bug worth a PR. `client/Design.md` remains the long-form reference: component-by-component recipes, the keyboard map, the copy rules and the ChaiUI alignment notes. This file is the summary a new contributor reads first, and the token list a tool can read.
