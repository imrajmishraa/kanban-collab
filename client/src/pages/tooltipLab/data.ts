import type {
  Placement,
  TooltipShape,
  TooltipSize,
  TooltipTheme,
  TooltipTone,
} from "@/components/Tooltips/types";

/** Everything the lab lists, kept as data so the page reads as rows of examples. */
export const SHAPES: TooltipShape[] = [
  "default",
  "sharp",
  "soft",
  "pill",
  "card",
  "glass",
  "neon",
  "gradient",
  "ink",
  "outline",
  "terminal",
  "badge",
  "solid",
];

export const TONES: TooltipTone[] = [
  "neutral",
  "brand",
  "success",
  "warning",
  "danger",
];

export const THEMES: TooltipTheme[] = ["auto", "dark", "light"];
export const SIZES: TooltipSize[] = ["sm", "md", "lg"];

export const PLACEMENTS: Placement[] = [
  "top",
  "bottom",
  "left",
  "right",
  "top-start",
  "top-end",
  "bottom-start",
  "bottom-end",
];
