import type { CSSProperties } from "react";

/**
 * `CSSProperties` does not know about custom properties, and every surface here
 * is one. This is the narrow cast, named once instead of repeated per map.
 */
export type CssVars = CSSProperties &
  Record<`--${string}`, string | number | undefined>;

/* ── Variants ─────────────────────────────────────────────────────
   Same shape of API as `components/Tooltips/ToolTip.tsx`: a handful of named
   variants plus escape hatches. Every map below is a plain record, so a new
   variant is one line and no branching. */

/** Type scale inside the toast. `md` is the historical default. */
export type ToasterSize = "sm" | "md" | "lg";

/** Corner + padding. `default` matches the card radius used across the app. */
export type ToasterShape =
  "default" | "sharp" | "soft" | "pill" | "card" | "glass";

/** Which surface a toast is painted on. `auto` is the app's elevated panel. */
export type ToasterTone = "auto" | "brand" | "success" | "danger" | "neutral";

export type ToasterPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type ToasterTheme = "light" | "dark" | "system";

export const SHAPE_CLASS: Record<ToasterShape, string> = {
  default: "!rounded-[12px]",
  sharp: "!rounded-[4px]",
  soft: "!rounded-[16px]",
  pill: "!rounded-full",
  card: "!rounded-[20px]",
  glass: "!rounded-[16px] !backdrop-blur-md",
};

export const SIZE_CLASS: Record<
  ToasterSize,
  { title: string; description: string }
> = {
  sm: {
    title: "!text-[12px] !font-semibold !leading-[1.35]",
    description: "!text-[11px] !leading-[1.5] !text-(--text-muted)",
  },
  md: {
    title: "!text-[13px] !font-semibold !leading-[1.35] !tracking-[-0.1px]",
    description:
      "!text-[12px] !leading-[1.5] !tracking-[-0.05px] !text-(--text-muted)",
  },
  lg: {
    title: "!text-[15px] !font-semibold !leading-[1.35]",
    description: "!text-[13px] !leading-[1.5] !text-(--text-muted)",
  },
};

/**
 * Surface overrides per tone.
 *
 * These are CSS variables, not classes, because sonner paints the toast with
 * `background: var(--normal-bg)` — a `!bg-*` utility would set
 * `background-color` while the gradient in `--normal-bg` stayed on top.
 */
export const SURFACE_BY_TONE: Record<ToasterTone, CssVars> = {
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
};

/**
 * Sonner stops reading `--width` below 600px: its own media query makes the
 * toaster full-bleed and gives each toast `calc(100% - 2 × mobileOffset)`. So
 * the mobile width cannot be another `--width` value — it has to be a cap on
 * the toast itself, at sonner's breakpoint rather than Tailwind's `sm` (640px),
 * or the 600–640px band would shrink a desktop toast.
 */
export const MOBILE_WIDTH = [
  "[@media(max-width:600px)]:[&_[data-sonner-toast]]:!mx-auto",
  "[@media(max-width:600px)]:[&_[data-sonner-toast]]:!max-w-[340px]",
].join(" ");

/**
 * What sonner reads for the surface.
 *
 * `--normal-bg` takes an image as well as a colour, so it carries a gradient:
 * four percent of the ink at the top edge falling into the elevated surface.
 * That highlight is the difference between a panel and a slab — it is the same
 * trick `m-card` uses, at toast scale.
 */
export const SURFACE: CssVars = {
  "--normal-bg":
    "linear-gradient(to bottom, color-mix(in srgb, var(--text-primary) 5%, var(--bg-elevated)), var(--bg-elevated) 62%)",
  "--normal-border": "var(--border)",
  "--normal-text": "var(--text-primary)",
  "--border-radius": "12px",
  "--width": "380px",
};

/** `number` is px, `string` is passed through (`"28rem"`, `"60vw"`). */
export const dimension = (
  value: number | string | undefined,
): string | undefined =>
  value === undefined
    ? undefined
    : typeof value === "number"
      ? `${value}px`
      : value;
