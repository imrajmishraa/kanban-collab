import { TOAST_MS, type CssVars } from "@/lib/toastTokens";

import type {
  DescriptionSize,
  ToasterAnimation,
  ToasterConfig,
  ToasterPreset,
  ToasterShape,
  ToasterSize,
} from "./toasterTypes";

/* The types are the public API of this folder; the tables below are its body.
   Re-exported so a caller still imports both from one path. */
export type * from "./toasterTypes";

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

  /* Silhouette. `speech` points down-left, `tab` squares its foot, `squircle`
     leans on the newer corner-shape property, `chamfer` and `ticket` cut the
     corners with a clip path — which also clips the shadow, as it does on a
     tooltip. */
  speech: "!rounded-[14px] !rounded-bl-[2px]",
  tab: "!rounded-t-[10px] !rounded-b-none",
  squircle: "!rounded-[22px] [corner-shape:squircle]",
  chamfer:
    "!rounded-none [clip-path:polygon(10px_0,calc(100%-10px)_0,100%_10px,100%_calc(100%-10px),calc(100%-10px)_100%,10px_100%,0_calc(100%-10px),0_10px)]",
  ticket:
    "!rounded-md [clip-path:radial-gradient(circle_6px_at_0_50%,transparent_98%,black)_left/51%_100%_no-repeat,radial-gradient(circle_6px_at_100%_50%,transparent_98%,black)_right/51%_100%_no-repeat]",
  blob: "!rounded-[44%_56%_52%_48%/56%_44%_56%_44%]",

  /* Border. The tone still supplies the colour; these change the edge's shape. */
  dashed: "!rounded-[12px] !border-dashed",
  double:
    "!rounded-[12px] !ring-1 !ring-(--hairline-strong) !ring-offset-2 !ring-offset-(--bg-root)",
  keycap: "!rounded-md !border-b-[3px]",
  sticker: "!rounded-md !border-2 !-rotate-1",
  callout: "!rounded-[12px] !border-l-[3px] !border-l-current",
};

/**
 * The title's scale, and the step each size gives the description.
 *
 * The description's *ink* is not here: it is `--toast-description`, so a tone or
 * a `description.color` can move it without a new class.
 */
export const SIZE_CLASS: Record<
  ToasterSize,
  { title: string; description: string }
> = {
  xs: {
    title: "!text-[11px] !font-semibold !leading-[1.3]",
    description: "!text-[10px] !leading-[1.45]",
  },
  sm: {
    title: "!text-[12px] !font-semibold !leading-[1.35]",
    description: "!text-[11px] !leading-[1.5]",
  },
  md: {
    title: "!text-[13px] !font-semibold !leading-[1.35] !tracking-[-0.1px]",
    description: "!text-[12px] !leading-[1.5] !tracking-[-0.05px]",
  },
  lg: {
    title: "!text-[15px] !font-semibold !leading-[1.35]",
    description: "!text-[13px] !leading-[1.5]",
  },
  xl: {
    title: "!text-[17px] !font-semibold !leading-[1.3] !tracking-[-0.15px]",
    description: "!text-[14px] !leading-[1.5]",
  },
};

/** A description size the caller set explicitly, whatever the title's step. */
export const DESCRIPTION_SIZE_CLASS: Record<DescriptionSize, string> = {
  xs: "!text-[10px] !leading-[1.45]",
  sm: "!text-[11px] !leading-[1.5]",
  md: "!text-[12px] !leading-[1.5]",
  lg: "!text-[13px] !leading-[1.5]",
};

/** The description's ink, which a tone or `description.color` overrides. */
export const DESCRIPTION_INK = "!text-(--toast-description)";

/** The transition each animation runs on. */
export const ANIMATION_CLASS: Record<ToasterAnimation, string> = {
  fade: "!transition-opacity !duration-300 !ease-[cubic-bezier(0.21,0.47,0.32,0.98)]",
  slide:
    "!transition-transform !duration-300 !ease-[cubic-bezier(0.21,0.47,0.32,0.98)]",
  scale:
    "!transition-[transform,opacity] !duration-300 !ease-[cubic-bezier(0.21,0.47,0.32,0.98)]",
  none: "!transition-none",
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
  /* Two inks a tone can replace. The description and the close glyph are the
     two places a filled surface used to keep a grey from the page. */
  "--toast-description": "var(--text-muted)",
  "--toast-close": "var(--text-muted)",
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
    appearance: { size: "sm", fill: "soft" },
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
