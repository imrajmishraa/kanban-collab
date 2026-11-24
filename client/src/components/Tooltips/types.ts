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
  | "solid";

export type TooltipTone =
  "neutral" | "brand" | "success" | "warning" | "danger";
export type TooltipTheme = "auto" | "dark" | "light";
export type TooltipSize = "sm" | "md" | "lg";

export interface TooltipProps {
  label: ReactNode;
  description?: ReactNode;
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
  /**
   * Use the tooltip as the trigger's accessible *name* rather than its description.
   * For icon-only buttons, where the tooltip is the only text there is.
   */
  labelledBy?: boolean;
  /** Render the child as the trigger itself — no wrapper span around it. */
  asChild?: boolean;
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
