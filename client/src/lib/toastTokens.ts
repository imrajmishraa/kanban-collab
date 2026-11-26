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
 * `auth` is a tone here rather than a variant of its own: it is a surface like
 * the others, and keeping it in a second table meant a second writer of
 * `--normal-bg`, which is how a brand tone and an auth toast could resolve to
 * different colours with no warning.
 */
export type ToastTone =
  "auto" | "brand" | "success" | "danger" | "neutral" | "auth";

export const TONE_SURFACE: Record<ToastTone, CssVars> = {
  auto: {},
  brand: {
    "--normal-bg": "var(--brand)",
    "--normal-border": "color-mix(in srgb, var(--brand) 70%, black)",
    "--normal-text": "var(--auth-ink)",
  },
  success: {
    "--normal-bg": "var(--success)",
    "--normal-border": "color-mix(in srgb, var(--success) 70%, black)",
    "--normal-text": "var(--auth-ink)",
  },
  danger: {
    "--normal-bg": "var(--danger)",
    "--normal-border": "color-mix(in srgb, var(--danger) 70%, black)",
    "--normal-text": "var(--auth-ink)",
  },
  neutral: {
    "--normal-bg": "var(--bg-elevated)",
    "--normal-border": "var(--border)",
    "--normal-text": "var(--text-primary)",
  },
  auth: {
    "--normal-bg": "var(--auth)",
    "--normal-border": "color-mix(in srgb, var(--auth) 70%, black)",
    "--normal-text": "var(--auth-ink)",
  },
};

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
