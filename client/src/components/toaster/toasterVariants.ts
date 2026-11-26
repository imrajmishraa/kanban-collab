import type { ReactNode } from "react";
import type { ToastClassnames } from "sonner";

import { TOAST_MS, type CssVars, type ToastTone } from "@/lib/toastTokens";

/* ── Types ──────────────────────────────────────────────────────────
   The API is seven axes, not twenty props: `docs/change-rules.md` §3.3 caps a
   component at eight props and asks for a `variant`/`slot` split past that. The
   attributes live inside the groups, so a new one costs a field rather than a
   prop. */

/** Type scale inside the toast. `md` is the historical default. */
export type ToasterSize = "sm" | "md" | "lg";

/** Corner + padding. `default` matches the card radius used across the app. */
export type ToasterShape =
  "default" | "sharp" | "soft" | "pill" | "card" | "glass";

/** Which surface a toast is painted on. `auto` is the app's elevated panel. */
export type ToasterTone = ToastTone;

export type ToasterTheme = "light" | "dark" | "system";

export type ToasterPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type SwipeDirection = "top" | "right" | "bottom" | "left";

/** Everything painted, nothing positioned. */
export interface AppearanceOptions {
  shape?: ToasterShape;
  size?: ToasterSize;
  tone?: ToasterTone;
  theme?: ToasterTheme;
  /** Replaces the five status glyphs, or sonner's own close glyph. */
  icons?: Partial<Record<ToasterIconName, ReactNode>>;
}

/** The glyphs sonner accepts — the five statuses plus `close`. */
export type ToasterIconName =
  "success" | "error" | "warning" | "info" | "loading" | "close";

/** Everything measured, no colour. */
export interface LayoutOptions {
  position?: ToasterPosition;
  /** Fixed stack width — sonner's `--width`. */
  width?: number | string;
  /** Cap on a single toast, in addition to `width`. */
  maxWidth?: number | string;
  /**
   * Cap below sonner's 600px breakpoint, where it stops reading `--width` and
   * gives each toast `calc(100% - 2 × mobileOffset)` instead.
   */
  mobileWidth?: number | string;
  /** Minimum height of a toast — useful when every toast should be one size. */
  height?: number | string;
  /** Maximum height; longer content is clipped by sonner's own overflow. */
  maxHeight?: number | string;
  /** Space between stacked toasts. */
  gap?: number;
  /** Distance from the viewport edge — a number, a CSS length, or per edge. */
  offset?:
    | number
    | string
    | Partial<Record<"top" | "right" | "bottom" | "left", number | string>>;
  /** Same, on narrow screens. */
  mobileOffset?:
    | number
    | string
    | Partial<Record<"top" | "right" | "bottom" | "left", number | string>>;
  /** Show every stacked toast, rather than collapsing them. */
  expand?: boolean;
  /** How many toasts can be on screen at once. */
  visibleToasts?: number;
}

/** What a toast does over time. */
export interface BehaviourOptions {
  /** Default lifetime in ms; a per-toast duration still wins. */
  duration?: number;
  /** Show the dismiss button. */
  closeButton?: boolean;
  /** Dismiss button shape: `md` (rounded-md) or `round`. */
  closeButtonShape?: "md" | "round";
  /** Which ways a toast can be swiped away. */
  swipeDirections?: SwipeDirection[];
  /** Keyboard shortcut that focuses the stack — one registration, per §6. */
  hotkey?: string[];
}

/** The labels a screen reader reads. Two stacks need two names. */
export interface A11yOptions {
  containerLabel?: string;
  toastLabel?: string;
  closeLabel?: string;
}

export type ToasterPreset =
  "default" | "quiet" | "assertive" | "auth" | "compact";

/** sonner's own class map, plus the one slot sonner does not name: the root. */
export type ToasterClassNames = Partial<ToastClassnames> & { toaster?: string };

/** The four attribute groups — what a preset fills. */
export interface ToasterConfig {
  appearance?: AppearanceOptions;
  layout?: LayoutOptions;
  behaviour?: BehaviourOptions;
  a11y?: A11yOptions;
}

export interface ToasterProps extends ToasterConfig {
  /** Names this stack, so a second toaster can run beside it. */
  id?: string;
  /** One word for a whole configuration. Explicit attributes always win. */
  preset?: ToasterPreset;
  classNames?: ToasterClassNames;
}

/* ── Variants ─────────────────────────────────────────────────────
   Every map below is a plain record, so a new variant is one line and no
   branching. */

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

/* One number, one place: these were 380 in three spots and 340 in a class
   string that could not be overridden. */
export const DEFAULT_WIDTH_PX = 380;
export const MOBILE_WIDTH_PX = 340;

/**
 * What sonner reads for the surface.
 *
 * `--normal-bg` takes an image as well as a colour, so it carries a gradient:
 * four percent of the ink at the top edge falling into the elevated surface.
 * That highlight is the difference between a panel and a slab — it is the same
 * trick `m-card` uses, at toast scale.
 *
 * The radius is *not* here: `SHAPE_CLASS` owns it. Two writers of the same
 * number is the trap `AGENTS.md` §4 records.
 */
export const SURFACE: CssVars = {
  "--normal-bg":
    "linear-gradient(to bottom, color-mix(in srgb, var(--text-primary) 5%, var(--bg-elevated)), var(--bg-elevated) 62%)",
  "--normal-border": "var(--border)",
  "--normal-text": "var(--text-primary)",
  "--width": `${DEFAULT_WIDTH_PX}px`,
  "--toast-mobile-width": `${MOBILE_WIDTH_PX}px`,
};

/**
 * Sonner stops reading `--width` below 600px: its own media query makes the
 * toaster full-bleed and gives each toast `calc(100% - 2 × mobileOffset)`. So
 * the mobile width cannot be another `--width` value — it has to be a cap on
 * the toast itself, at sonner's breakpoint rather than Tailwind's `sm` (640px),
 * or the 600–640px band would shrink a desktop toast.
 *
 * The cap is read from `--toast-mobile-width` rather than written into the
 * class, because a class built by interpolation is never generated at build
 * time — and because a hardcoded 340 disagreed with any `mobileOffset` that was
 * not the default.
 */
export const MOBILE_WIDTH = [
  "[@media(max-width:600px)]:[&_[data-sonner-toast]]:!mx-auto",
  "[@media(max-width:600px)]:[&_[data-sonner-toast]]:!max-w-[var(--toast-mobile-width)]",
].join(" ");

/**
 * One word for a configuration.
 *
 * Merged under the explicit groups, never over them: a preset that could
 * override what the caller wrote would be the transient-mode-in-a-persisted-key
 * trap with a nicer name.
 */
export const PRESET: Record<ToasterPreset, ToasterConfig> = {
  default: {},
  quiet: {
    appearance: { size: "sm" },
    layout: { visibleToasts: 1 },
    behaviour: { closeButton: false, duration: TOAST_MS.moment },
  },
  assertive: {
    layout: { visibleToasts: 5, expand: true },
    behaviour: { duration: 8000 },
  },
  auth: {
    appearance: { tone: "auth", size: "lg" },
    behaviour: { duration: TOAST_MS.moment },
  },
  compact: {
    appearance: { size: "sm" },
    layout: { width: 320, gap: 6, offset: 12 },
  },
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
