import type {
  TooltipShape,
  TooltipTone,
  TooltipTheme,
  TooltipSize,
  Side,
} from "./types";

export const DEFAULT_GAP = 8;
export const MARGIN = 8;

export const ORIGIN: Record<Side, string> = {
  top: "center bottom",
  bottom: "center top",
  left: "right center",
  right: "left center",
};

export const SHAPE_CLASS: Record<TooltipShape, string> = {
  default: "rounded-lg px-2.5 py-1",
  sharp: "rounded-[3px] px-2.5 py-1",
  soft: "rounded-xl px-3 py-1.5",
  pill: "rounded-full px-3.5 py-1",
  card: "rounded-xl px-3.5 py-2.5",
  glass:
    "rounded-xl px-3 py-1.5 border-(--hairline-strong) bg-(--tint-6) backdrop-blur-md text-(--text-primary)",
  neon: "rounded-lg px-3 py-1.5 border-(--accent-soft) bg-(--accent-soft) text-(--accent)",
  gradient:
    "rounded-lg px-3 py-1.5 font-medium border-(--accent-soft) bg-(--accent-soft) text-(--accent)",
  ink: "rounded-md px-2.5 py-1 border-(--hairline) bg-(--bg-root) text-(--text-primary)",
  outline:
    "rounded-md px-2.5 py-1 border-(--hairline-strong) bg-transparent text-(--text-soft)",
  terminal:
    "rounded-[4px] px-2.5 py-1 border-(--hairline) bg-(--bg-card) font-mono text-[10px] tracking-wider text-(--text-muted)",
  badge:
    "rounded-full px-3.5 py-1 border-(--accent-soft) bg-(--accent-soft) text-(--accent) font-medium",
  solid:
    "rounded-[10px] px-3 py-1.5 border border-(--inverse-border) bg-(--inverse-bg) text-(--inverse-text)",
};

export const TONE_CLASS: Record<TooltipTone, string> = {
  neutral: "",
  brand: "border-(--accent-soft) text-(--accent)",
  success: "border-(--success)/30 text-(--success)",
  warning: "border-(--warning)/30 text-(--warning)",
  danger: "border-(--danger)/30 text-(--danger)",
};

export const ARROW_CLASS: Record<TooltipShape, string> = {
  default: "border-(--inverse-border) bg-(--inverse-bg)",
  sharp: "border-(--inverse-border) bg-(--inverse-bg)",
  soft: "border-(--inverse-border) bg-(--inverse-bg)",
  pill: "border-(--inverse-border) bg-(--inverse-bg)",
  card: "border-(--inverse-border) bg-(--inverse-bg)",
  glass: "border-(--hairline-strong) bg-(--tint-6)",
  neon: "border-(--accent-soft) bg-(--accent-soft)",
  gradient: "border-(--accent-soft) bg-(--accent-soft)",
  ink: "border-(--hairline) bg-(--bg-root)",
  outline: "border-(--hairline-strong) bg-transparent",
  terminal: "border-(--hairline) bg-(--bg-card)",
  badge: "border-(--accent-soft) bg-(--accent-soft)",
  solid: "border-(--inverse-border) bg-(--inverse-bg)",
};

export const INVERTED_SHAPES = new Set<TooltipShape>([
  "default",
  "sharp",
  "soft",
  "pill",
  "card",
  "solid",
]);

export const THEME_CLASS: Record<TooltipTheme, string> = {
  auto: "",
  dark: "border-[rgb(58,58,62)] bg-[rgb(20,20,21)] text-[rgb(245,245,245)]",
  light: "border-[rgb(226,226,226)] bg-[rgb(255,255,255)] text-[rgb(23,23,23)]",
};

export const THEME_ARROW_CLASS: Record<TooltipTheme, string> = {
  auto: "",
  dark: "border-[rgb(58,58,62)] bg-[rgb(20,20,21)]",
  light: "border-[rgb(226,226,226)] bg-[rgb(255,255,255)]",
};

export const THEME_HIGHLIGHT_CLASS: Record<TooltipTheme, string> = {
  auto: "",
  dark: "text-[rgb(255,228,180)]",
  light: "text-[rgb(146,64,14)]",
};

export const SIZE_CLASS: Record<TooltipSize, string> = {
  sm: "text-[10px]",
  md: "text-[11px]",
  lg: "text-[13px]",
};
