import type { ReactNode, CSSProperties } from "react";

export type Side = "top" | "bottom" | "left" | "right";
/**
 * `start` / `end` are the RTL-safe spelling of left / right and are what the list asked
 * for (`bottom-start`, `top-end`). They normalise to left / right when placing.
 */
export type Align = "left" | "center" | "right" | "start" | "end";
/**
 * `side` or `side-align`. The list asked for "bottom-start, top-end" style placement, and
 * the position maths already understood it — the type was just narrower than the code.
 */
export type Placement = `${Side}-${Align}` | Side;

export type TooltipShape =
  | "default"
  | "sharp"
  | "soft"
  | "pill"
  | "card"
  | "glass"
  | "neon"
  | "gradient"
  | "ink"
  | "outline"
  | "terminal"
  | "badge"
  | "solid"
  /* Silhouette */
  | "speech"
  | "tab"
  | "squircle"
  | "chamfer"
  | "ticket"
  | "blob"
  /* Border and surface */
  | "dashed"
  | "double"
  | "stacked"
  | "paper"
  | "blueprint"
  | "gradient-border"
  | "sticker"
  | "keycap"
  /* Layout */
  | "callout"
  | "bare";

export type TooltipTone =
  | "neutral"
  | "brand"
  | "success"
  | "warning"
  | "danger"
  /** Informational: in progress, a hint, a queued change. Never a failure. */
  | "info"
  /** De-emphasis, not meaning — for `bare` and `dashed` in dense toolbars. */
  | "muted";
export type TooltipTheme = "auto" | "dark" | "light";
export type TooltipSize = "sm" | "md" | "lg";

export interface TooltipProps {
  label: ReactNode;
  description?: ReactNode;
  /**
   * The description line's own tone. It inherits the bubble's by default; a neutral hint
   * with one warning line inside it is the reason this exists.
   */
  descriptionTone?: TooltipTone;
  shortcut?: string[];
  placement?: Placement;
  /**
   * The original, pre-refactor prop — kept so every existing call site keeps working and
   * keeps its exact placement. `placement` wins when both are given.
   */
  side?: Side;
  children: ReactNode;
  className?: string;
  delay?: number;
  hideDelay?: number;
  disabled?: boolean;
  width?: number | string;
  maxWidth?: number | string;
  height?: number | string;
  maxHeight?: number | string;
  align?: Align;
  shape?: TooltipShape;
  tone?: TooltipTone;
  theme?: TooltipTheme;
  size?: TooltipSize;
  caret?: "auto" | "none";
  highlight?: ReactNode;
  gap?: number;
  bubbleClassName?: string;
  followCursor?: boolean | "x" | "y";
  interactive?: boolean;
  /** Fine-tune after the side and alignment are settled. */
  offset?: { x?: number; y?: number };
  /** Show only when the trigger's text is actually clipped. */
  truncationOnly?: boolean;
  /** Hide on its own after this many ms — "Copied!" and friends. */
  autoHide?: number;
  /** Clamp a long description to this many lines. */
  maxLines?: number;
  /** A status dot, a small glyph — sits before the label. */
  icon?: ReactNode;
  /** A spinner in place of the icon, for "Saving…" style bubbles. */
  loading?: boolean;
  /** An avatar image before the label, for presence and assignment. */
  avatar?: { src: string; alt?: string };
  /** A subtle ring on the anchor while the bubble is up. */
  highlightAnchor?: boolean;
  /**
   * Use the tooltip as the trigger's accessible *name* rather than its description.
   * For icon-only buttons, where the tooltip is the only text there is.
   */
  labelledBy?: boolean;
  /** Render the child as the trigger itself — no wrapper span around it. */
  asChild?: boolean;
  /**
   * A value the bubble can copy. Renders a copy button that writes it and announces the
   * result — ids, tokens and links are what tooltips are asked for most.
   */
  copyValue?: string;
  /** Small buttons inside the bubble. Implies `interactive`. */
  actions?: ReactNode;
  /**
   * Sides to try after `placement`, in your order. Without this the roomiest side wins,
   * which is right by area and wrong by intent.
   */
  fallbackSides?: Side[];
  /**
   * Clamp inside this element instead of the viewport — a modal or a scroll container.
   * Without it a bubble in a dialog can clamp against a window the dialog does not fill.
   */
  boundaryRef?: React.RefObject<HTMLElement | null>;
  /** What opens it. `manual` leaves it entirely to `open`. */
  trigger?: "hover" | "focus" | "click" | "manual";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Ye use ho raha hai taaki lint error na aaye
export interface PlacementState {
  side: Side;
  align: Align;
  style: CSSProperties;
  arrow: CSSProperties;
}
