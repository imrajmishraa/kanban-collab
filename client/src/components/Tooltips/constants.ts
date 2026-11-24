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

  /* ── Silhouette ── */
  speech: "px-3 py-1.5",
  tab: "px-3 py-1.5",
  squircle: "rounded-2xl px-3 py-1.5 [corner-shape:squircle]",
  chamfer:
    "rounded-none px-3 py-1.5 [clip-path:polygon(8px_0,calc(100%-8px)_0,100%_8px,100%_calc(100%-8px),calc(100%-8px)_100%,8px_100%,0_calc(100%-8px),0_8px)]",
  ticket:
    "rounded-md px-3 py-1.5 [clip-path:radial-gradient(circle_6px_at_0_50%,transparent_98%,black)_left/51%_100%_no-repeat,radial-gradient(circle_6px_at_100%_50%,transparent_98%,black)_right/51%_100%_no-repeat]",
  blob: "rounded-[44%_56%_52%_48%/56%_44%_56%_44%] px-4 py-2",

  /* ── Border and surface ── */
  dashed: "rounded-lg border-dashed px-2.5 py-1",
  double:
    "rounded-lg px-2.5 py-1 ring-1 ring-(--hairline-strong) ring-offset-2 ring-offset-(--bg-root)",
  stacked: "rounded-lg px-2.5 py-1 shadow-[3px_3px_0_0_var(--hairline)]",
  paper:
    "rounded-sm border-(--hairline) bg-(--bg-card) px-3 py-1.5 text-(--text-primary)",
  blueprint:
    "rounded-md px-3 py-1.5 bg-(--bg-card) bg-[radial-gradient(var(--hairline)_1px,transparent_1px)] bg-[length:6px_6px]",
  "gradient-border":
    "rounded-lg px-2.5 py-1 ring-1 ring-(--accent-soft) ring-offset-1 ring-offset-(--bg-root)",
  sticker: "rounded-md -rotate-1 border-2 px-2.5 py-1",
  keycap: "rounded-md border-b-[3px] px-2.5 py-1",

  /* ── Layout ── */
  callout: "rounded-md border-l-[3px] border-l-current px-3 py-1.5",
  bare: "rounded-none border-0 border-b border-b-current bg-transparent px-1 py-0.5",
};

export const TONE_CLASS: Record<TooltipTone, string> = {
  neutral: "",
  brand: "border-(--accent-soft) text-(--accent)",
  success: "border-(--success)/30 text-(--success)",
  warning: "border-(--warning)/30 text-(--warning)",
  danger: "border-(--danger)/30 text-(--danger)",
  info: "border-(--link)/30 text-(--link)",
  muted: "text-(--text-muted)",
};

/** Text-only tone, for a line inside a bubble that is already coloured by another tone. */
export const TONE_TEXT_CLASS: Record<TooltipTone, string> = {
  neutral: "text-(--text-muted)",
  brand: "text-(--accent)",
  success: "text-(--success)",
  warning: "text-(--warning)",
  danger: "text-(--danger)",
  info: "text-(--link)",
  muted: "text-(--text-muted)",
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

  /* Silhouette: the clipped ones carry no caret at all (`CARETLESS_SHAPES`), so their arrow
     class is never used — empty rather than invented. */
  speech: "border-(--inverse-border) bg-(--inverse-bg)",
  tab: "border-(--inverse-border) bg-(--inverse-bg)",
  squircle: "border-(--inverse-border) bg-(--inverse-bg)",
  chamfer: "",
  ticket: "",
  blob: "",

  /* Border and surface: the tail follows the surface it hangs from. */
  dashed: "border-(--inverse-border) bg-(--inverse-bg)",
  double: "border-(--hairline-strong) bg-(--inverse-bg)",
  stacked: "border-(--inverse-border) bg-(--inverse-bg)",
  paper: "border-(--hairline) bg-(--bg-card)",
  blueprint: "border-(--hairline) bg-(--bg-card)",
  "gradient-border": "border-(--accent-soft) bg-(--inverse-bg)",
  sticker: "border-(--inverse-border) bg-(--inverse-bg)",
  keycap: "border-(--inverse-border) bg-(--inverse-bg)",

  /* Layout */
  callout: "border-(--inverse-border) bg-(--inverse-bg)",
  bare: "border-current bg-transparent",
};

/**
 * Shapes whose outline is a `clip-path`. The caret is a rotated square *outside* the bubble,
 * so a clip cuts it off; these render without one.
 */
export const CARETLESS_SHAPES: ReadonlySet<TooltipShape> = new Set([
  "chamfer",
  "ticket",
  "blob",
]);

/* The caret follows the bubble's tone as well as its shape, or a danger bubble wears a
   neutral tail. */
export const ARROW_TONE_CLASS: Record<TooltipTone, string> = {
  neutral: "",
  brand: "border-(--accent-soft)",
  success: "border-(--success)/30",
  warning: "border-(--warning)/30",
  danger: "border-(--danger)/30",
  info: "border-(--link)/30",
  muted: "",
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

/**
 * Which way the bubble arrives from.
 *
 * A bubble above its anchor rises into place, so it starts *below* its final position; a
 * bubble below starts above. The bubble grows out of the anchor instead of appearing on it.
 */
export const ENTER_OFFSET: Record<Side, string> = {
  top: "translate-y-1",
  bottom: "-translate-y-1",
  left: "translate-x-1",
  right: "-translate-x-1",
};

/** How long the exit takes. Arriving is 200ms; leaving is quicker than arriving. */
export const EXIT_MS = 120;

/* ── Silhouette ─────────────────────────────────────────────────────────
   These change the *outline*, not the colour. The two that depend on which side the bubble
   sits on (`speech`, `tab`) are why `SHAPE_CLASS` is a function and not a record: the sharp
   corner has to face the anchor. */

const SPEECH_BY_SIDE: Record<Side, string> = {
  /* The sharp corner faces the anchor: below the anchor, the top-left is sharp. */
  bottom: "rounded-lg rounded-tl-none",
  top: "rounded-lg rounded-bl-none",
  right: "rounded-lg rounded-tl-none",
  left: "rounded-lg rounded-tr-none",
};

const TAB_BY_SIDE: Record<Side, string> = {
  bottom: "rounded-b-lg rounded-t-none",
  top: "rounded-t-lg rounded-b-none",
  right: "rounded-r-lg rounded-l-none",
  left: "rounded-l-lg rounded-r-none",
};

/** A shape's padding and outline. `side` matters only for `speech` and `tab`. */
export function shapeClass(shape: TooltipShape, side?: Side): string {
  if (shape === "speech") return SPEECH_BY_SIDE[side ?? "bottom"];
  if (shape === "tab") return TAB_BY_SIDE[side ?? "bottom"];

  return SHAPE_CLASS[shape];
}

/**
 * Shapes that need the anchor's gap closed: a tab is *attached* to what it labels, so the
 * 8px a normal bubble keeps would leave it floating.
 */
export const SHAPE_GAP: Partial<Record<TooltipShape, number>> = {
  tab: 0,
  speech: 4,
};
