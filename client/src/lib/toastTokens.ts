import type { CSSProperties } from "react";

/**
 * The facts both halves of the toast read.
 *
 * `lib/toast.ts` decides when a toast appears and how long it lives; the toaster
 * decides how it is painted. Each used to carry its own copy — a colour table
 * each, four lifetimes between them — so `<Toaster tone="brand">` and a toast's
 * own private auth surface could disagree and no test would notice. This is the
 * one copy. It lives in `lib/` because `lib/` may not import `components/`
 * (`docs/change-rules.md` §4), and both sides need it.
 */

/**
 * `CSSProperties` does not know about custom properties, and every surface here
 * is one. This is the narrow cast, named once instead of repeated per map.
 */
export type CssVars = CSSProperties &
  Record<`--${string}`, string | number | undefined>;

/**
 * The surfaces a toast can be painted on.
 *
 * These are CSS variables, not classes, because sonner paints the toast with
 * `background: var(--normal-bg)` — a `!bg-*` utility would set
 * `background-color` while the gradient in `--normal-bg` stayed on top.
 *
 * Every tone carries three inks, not one. `--normal-text` is the title, and the
 * two below it are the reason a filled surface stays readable: a description and
 * a close glyph in `--text-muted` are grey on a saturated fill, which is what
 * this table used to do for `brand`, `success`, `danger` and `auth`.
 *
 * The ink on a status fill is `--inverse-text`, not `--auth-ink`. The status
 * tokens are bright in the dark theme and dark in the light one, and the ink has
 * to flip with them: white on `--success` is 1.9:1 and on `--warning` 1.8:1,
 * while `--inverse-text` gives 10.3:1 and 11.2:1 there and still clears 4.5:1 in
 * the light theme. `auth` is the exception — a blue that wants white in both.
 *
 * The set is `components/Tooltips/constants.ts`'s tone table plus the surfaces
 * `DESIGN.md` names elsewhere: `info` and `muted` are tones the tooltip already
 * had and the toast did not; `inverse` and `accent` are the tooltip's family and
 * the segmented control's pair; `auth` is this app's own blue.
 */
export type ToastTone =
  | "auto"
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "muted"
  | "auth"
  | "accent"
  | "inverse";

export const TONE_SURFACE: Record<ToastTone, CssVars> = {
  auto: {},
  brand: {
    "--normal-bg": "var(--brand)",
    "--normal-border": "color-mix(in srgb, var(--brand) 70%, black)",
    "--normal-text": "var(--inverse-text)",
    "--toast-description":
      "color-mix(in srgb, var(--inverse-text) 78%, transparent)",
    "--toast-close": "color-mix(in srgb, var(--inverse-text) 62%, transparent)",
  },
  success: {
    "--normal-bg": "var(--success)",
    "--normal-border": "color-mix(in srgb, var(--success) 70%, black)",
    "--normal-text": "var(--inverse-text)",
    "--toast-description":
      "color-mix(in srgb, var(--inverse-text) 78%, transparent)",
    "--toast-close": "color-mix(in srgb, var(--inverse-text) 62%, transparent)",
  },
  warning: {
    "--normal-bg": "var(--warning)",
    "--normal-border": "color-mix(in srgb, var(--warning) 70%, black)",
    "--normal-text": "var(--inverse-text)",
    "--toast-description":
      "color-mix(in srgb, var(--inverse-text) 76%, transparent)",
    "--toast-close": "color-mix(in srgb, var(--inverse-text) 58%, transparent)",
  },
  danger: {
    "--normal-bg": "var(--danger)",
    "--normal-border": "color-mix(in srgb, var(--danger) 70%, black)",
    "--normal-text": "var(--inverse-text)",
    "--toast-description":
      "color-mix(in srgb, var(--inverse-text) 78%, transparent)",
    "--toast-close": "color-mix(in srgb, var(--inverse-text) 62%, transparent)",
  },
  /* The tooltip's `info` tone, which the toast did not have. */
  info: {
    "--normal-bg": "var(--link)",
    "--normal-border": "color-mix(in srgb, var(--link) 70%, black)",
    "--normal-text": "var(--inverse-text)",
    "--toast-description":
      "color-mix(in srgb, var(--inverse-text) 78%, transparent)",
    "--toast-close": "color-mix(in srgb, var(--inverse-text) 62%, transparent)",
  },
  neutral: {
    "--normal-bg": "var(--bg-elevated)",
    "--normal-border": "var(--border)",
    "--normal-text": "var(--text-primary)",
    "--toast-description": "var(--text-muted)",
    "--toast-close": "var(--text-muted)",
  },
  /* A toast that recedes: the page's own surface, the tooltip's outline inks. */
  muted: {
    "--normal-bg": "var(--bg-surface)",
    "--normal-border": "var(--hairline)",
    "--normal-text": "var(--text-secondary)",
    "--toast-description": "var(--text-muted)",
    "--toast-close": "var(--text-subtle)",
  },
  auth: {
    "--normal-bg": "var(--auth)",
    "--normal-border": "color-mix(in srgb, var(--auth) 70%, black)",
    "--normal-text": "var(--auth-ink)",
    "--toast-description":
      "color-mix(in srgb, var(--auth-ink) 78%, transparent)",
    "--toast-close": "color-mix(in srgb, var(--auth-ink) 62%, transparent)",
  },
  accent: {
    "--normal-bg": "var(--accent-fill)",
    "--normal-border": "color-mix(in srgb, var(--accent) 32%, transparent)",
    "--normal-text": "var(--accent)",
    "--toast-description": "color-mix(in srgb, var(--accent) 76%, transparent)",
    "--toast-close": "color-mix(in srgb, var(--accent) 58%, transparent)",
  },
  inverse: {
    "--normal-bg": "var(--inverse-bg)",
    "--normal-border": "var(--inverse-border)",
    "--normal-text": "var(--inverse-text)",
    "--toast-description":
      "color-mix(in srgb, var(--inverse-text) 72%, transparent)",
    "--toast-close": "color-mix(in srgb, var(--inverse-text) 55%, transparent)",
  },
};

/**
 * How hard a tone is applied — the three surface treatments `DESIGN.md` already
 * defines for other components, rather than a name per combination:
 *
 * - `solid`   the tone fills the toast (`button-solid`, the status buttons).
 * - `soft`    the tone tints it and edges it, the ink stays the page's
 *             (`chip`, `brand-muted` + `brand-border`, `accent-soft`).
 * - `outline` no fill, the tone is only the edge (`button-danger`, the
 *             tooltip's `outline`).
 *
 * `solid` is the default, so every tone keeps the surface it had.
 */
export type ToastFill = "solid" | "soft" | "outline";

export const TOAST_FILLS: ToastFill[] = ["solid", "soft", "outline"];

/**
 * The colour a tone is built from. `TONE_SURFACE` holds the solid fill; the
 * other two are derived from this one token per tone, so a tone cannot be solid
 * in one colour and soft in another.
 */
export const TONE_COLOR: Record<ToastTone, string | undefined> = {
  auto: undefined,
  brand: "var(--brand)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
  info: "var(--link)",
  neutral: "var(--border)",
  muted: "var(--text-subtle)",
  auth: "var(--auth)",
  accent: "var(--accent)",
  inverse: "var(--inverse-text)",
};

/**
 * The surface for a tone at a given strength.
 *
 * `soft` and `outline` keep the page's ink and let the tone carry the fill and
 * the edge, which is the rule the toast already wrote down for itself: colour is
 * information here, it edges the surface and backs the icon, it does not become
 * the text.
 */
export function toneSurface(
  tone: ToastTone,
  fill: ToastFill = "solid",
): CssVars {
  if (fill === "solid") return TONE_SURFACE[tone];

  const color = TONE_COLOR[tone];

  /* `auto` is the gradient panel itself; there is nothing to soften. */
  if (color === undefined) return TONE_SURFACE[tone];

  if (fill === "soft") {
    return {
      "--normal-bg": `color-mix(in srgb, ${color} 12%, var(--bg-elevated))`,
      "--normal-border": `color-mix(in srgb, ${color} 40%, transparent)`,
      "--normal-text": "var(--text-primary)",
      "--toast-description": "var(--text-muted)",
      "--toast-close": "var(--text-muted)",
    };
  }

  return {
    "--normal-bg": "var(--bg-elevated)",
    "--normal-border": `color-mix(in srgb, ${color} 55%, transparent)`,
    "--normal-text": "var(--text-primary)",
    "--toast-description": "var(--text-muted)",
    "--toast-close": "var(--text-muted)",
  };
}

/**
 * Lifetimes, in ms — one table, read by the toaster's default and by the
 * per-kind overrides in `lib/toast.ts`.
 *
 * `moment` is the short one. A sign-in is read at a glance, and the `quiet`
 * preset wants the same lifetime, so both name it rather than each writing the
 * same number in a third place.
 */
export const TOAST_MS = {
  default: 4000,
  success: 3000,
  error: 6000,
  moment: 2500,
} as const;
