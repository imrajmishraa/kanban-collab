import type { ReactNode } from "react";
import type { ToastClassnames } from "sonner";

import type { ToastFill, ToastTone } from "@/lib/toastTokens";

/**
 * The toaster's public types.
 *
 * Split from `toasterVariants.ts` when the tables and the types together crossed
 * the 300-line budget for a `.ts` file (`docs/change-rules.md` §3): types and
 * tables are two responsibilities, and the tables are the half that grows.
 */

/* ── Types ──────────────────────────────────────────────────────────
   The API is seven axes, not twenty props: `docs/change-rules.md` §3.3 caps a
   component at eight props and asks for a `variant`/`slot` split past that. The
   attributes live inside the groups, so a new one costs a field rather than a
   prop. */

/** Type scale inside the toast. `md` is the historical default. */
export type ToasterSize = "xs" | "sm" | "md" | "lg" | "xl";

/** Corner + padding. `default` matches the card radius used across the app. */
export type ToasterShape =
  | "default"
  | "sharp"
  | "soft"
  | "pill"
  | "card"
  | "glass"
  /* Silhouette — the bubble is not a rectangle. */
  | "speech"
  | "tab"
  | "squircle"
  | "chamfer"
  | "ticket"
  | "blob"
  /* Border — the edge carries the character. */
  | "dashed"
  | "double"
  | "keycap"
  | "sticker"
  | "callout";

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
  /** How hard the tone is applied: a fill, a tint, or an edge. */
  fill?: ToastFill;
  theme?: ToasterTheme;
  /** Replaces the five status glyphs, or sonner's own close glyph. */
  icons?: Partial<Record<ToasterIconName, ReactNode>>;
  /**
   * An explicit title colour — any CSS colour or token. A tone sets one; this
   * is for the caller who wants a colour the tone table does not have. It goes
   * through `--normal-text`, never a generated class, because a class built
   * from a runtime string is never compiled.
   */
  ink?: string;
  /** The description's own type, ink and clamp. */
  description?: DescriptionOptions;
}

/** The description's own attributes, the ones the title does not share. */
export interface DescriptionOptions {
  /** Its own step on the type scale; `md` matches the title's step. */
  size?: DescriptionSize;
  /** Any CSS colour or token, overriding `--toast-description`. */
  color?: string;
  /**
   * Clamp to this many lines. `1` is a single line; anything not positive, or
   * absent, means natural height.
   */
  lines?: number;
}

/** The description's scale, one step narrower than the title's. */
export type DescriptionSize = "xs" | "sm" | "md" | "lg";

/** The glyphs sonner accepts — the five statuses plus `close`. */
export type ToasterIconName =
  "success" | "error" | "warning" | "info" | "loading" | "close";

/** Everything measured, no colour. */
export interface LayoutOptions {
  position?: ToasterPosition;
  /** Fixed stack width — sonner's `--width`. */
  width?: number | string;
  /** Floor for a single toast, below which the content wraps rather than shrinks. */
  minWidth?: number | string;
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

/**
 * What moves when a toast arrives and leaves.
 *
 * `scale` is the historical default: transform and opacity together. `fade` and
 * `slide` pick one property each, for a stack that should not draw attention to
 * itself; `none` is for a reader who has asked for no motion.
 */
export type ToastAnimation = "fade" | "slide" | "scale" | "none";

/**
 * How a toast arrives and leaves, as a group.
 *
 * `enter` and `exit` are separate because a stack that fades in and slides out
 * is a normal thing to want, and one property for both is the compromise that
 * makes it impossible. `duration` and `easing` are here rather than in
 * `behaviour` because they are the same decision.
 */
export interface AnimationOptions {
  /** What the toast does as it arrives. Default `scale`. */
  enter?: ToastAnimation;
  /** What it does as it leaves. Defaults to `enter`. */
  exit?: ToastAnimation;
  /** Transition length in ms. Default `300`. */
  duration?: number;
  /** A CSS timing function. Default the app's spring-ish cubic-bezier. */
  easing?: string;
  /**
   * Collapse to no motion when the reader asks for it, via `motion-reduce`.
   * Default `true` — an animation that ignores that preference is a bug.
   */
  respectReducedMotion?: boolean;
}

/**
 * The rail that shows how long a toast has left.
 *
 * Drawn as the toast's own `::after`, so it needs no extra element and cannot
 * be pushed out of the bubble by long content. It runs off `--toast-progress-
 * duration`, which the resolver sets from the stack's `duration` — the rail and
 * the timer cannot drift apart because they read the same number.
 */
export interface ProgressOptions {
  /** Show the rail. Default `false`. */
  visible?: boolean;
  /** Which edge it hugs. Default `bottom`. */
  position?: "top" | "bottom";
  /** Height in px. Default `2`. */
  thickness?: number;
  /** Any CSS colour or token. Default `--brand`. */
  color?: string;
  /** Run it down over the toast's lifetime. Default `true`. */
  animated?: boolean;
  /**
   * Show it on a loading toast. Default `true`, but a loading toast has no
   * lifetime to count down, so `false` is the honest setting for a stack that
   * uses `toastLoading`.
   */
  showOnLoading?: boolean;
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

/** The attribute groups — what a preset fills. */
export interface ToasterConfig {
  appearance?: AppearanceOptions;
  layout?: LayoutOptions;
  behaviour?: BehaviourOptions;
  /** A shorthand string, or the group when enter and exit differ. */
  animation?: ToastAnimation | AnimationOptions;
  progress?: ProgressOptions;
  a11y?: A11yOptions;
}

export interface ToasterProps extends ToasterConfig {
  /** Names this stack, so a second toaster can run beside it. */
  id?: string;
  /** One word for a whole configuration. Explicit attributes always win. */
  preset?: ToasterPreset;
  classNames?: ToasterClassNames;
}
