import type { ReactNode, CSSProperties } from "react";

export type Side = "top" | "bottom" | "left" | "right";
export type Align = "left" | "center" | "right";
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
