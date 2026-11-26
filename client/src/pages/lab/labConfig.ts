import {
  ANIMATION_CLASS,
  DESCRIPTION_SIZE_CLASS,
  PRESET,
  SHAPE_CLASS,
  SIZE_CLASS,
  type DescriptionSize,
  type ToastAnimation,
  type ToasterPosition,
  type ToasterPreset,
  type ToasterShape,
  type ToasterSize,
  type ToasterTheme,
  type ToasterTone,
  type ToasterProps,
} from "@/components/toaster/toasterVariants";
import { TOAST_FILLS, TONE_SURFACE, type ToastFill } from "@/lib/toastTokens";

/**
 * The lab's state, and the one place it becomes `Toaster` props.
 *
 * Every option list is derived from the component's own tables rather than
 * retyped, so a shape added to `SHAPE_CLASS` shows up in the lab without anyone
 * remembering to add it here (`AGENTS.md` §4, numbers that exist twice).
 *
 * The preset is a *fill*, not a prop: choosing one writes its values into the
 * controls, and the toaster is built from the controls alone. A lab where a
 * preset could silently override a control would be lying about what it shows.
 */

export type CloseButtonShape = "md" | "round";

export interface LabConfig {
  preset: ToasterPreset;
  shape: ToasterShape;
  size: ToasterSize;
  tone: ToasterTone;
  fill: ToastFill;
  /** 0 means no clamp. */
  maxLines: number;
  descSize: DescriptionSize | "auto";
  animation: ToastAnimation;
  /** 0 means no floor. */
  minWidth: number;
  /** Show the countdown rail. */
  progress: boolean;
  progressPosition: "top" | "bottom";
  theme: ToasterTheme;
  position: ToasterPosition;
  width: number;
  mobileWidth: number;
  gap: number;
  offset: number;
  visibleToasts: number;
  duration: number;
  expand: boolean;
  closeButton: boolean;
  closeButtonShape: CloseButtonShape;
}

export const SHAPES = Object.keys(SHAPE_CLASS) as ToasterShape[];
export const SIZES = Object.keys(SIZE_CLASS) as ToasterSize[];
export const TONES = Object.keys(TONE_SURFACE) as ToasterTone[];
export const FILLS = TOAST_FILLS;
export const RAIL_EDGES: Array<"top" | "bottom"> = ["bottom", "top"];
export const ANIMATIONS = Object.keys(ANIMATION_CLASS) as ToastAnimation[];
export const DESC_SIZES: Array<DescriptionSize | "auto"> = [
  "auto",
  ...(Object.keys(DESCRIPTION_SIZE_CLASS) as DescriptionSize[]),
];
export const PRESETS = Object.keys(PRESET) as ToasterPreset[];
export const THEMES: ToasterTheme[] = ["dark", "light", "system"];
export const CLOSE_SHAPES: CloseButtonShape[] = ["md", "round"];

/** sonner's six anchors. A union has no runtime form, so this list is the copy. */
export const POSITIONS: ToasterPosition[] = [
  "bottom-right",
  "bottom-center",
  "bottom-left",
  "top-right",
  "top-center",
  "top-left",
];

export const LAB_DEFAULTS: LabConfig = {
  preset: "default",
  shape: "default",
  size: "md",
  tone: "auto",
  fill: "solid",
  maxLines: 0,
  descSize: "auto",
  animation: "scale",
  minWidth: 0,
  progress: false,
  progressPosition: "bottom",
  theme: "dark",
  position: "bottom-right",
  width: 380,
  mobileWidth: 340,
  gap: 10,
  offset: 16,
  visibleToasts: 3,
  duration: 4000,
  expand: false,
  closeButton: true,
  closeButtonShape: "md",
};

/** Write a preset's values into the controls, leaving everything it does not name. */
export function applyPreset(
  preset: ToasterPreset,
  current: LabConfig,
): LabConfig {
  const { appearance = {}, layout = {}, behaviour = {} } = PRESET[preset];

  return {
    ...current,
    preset,
    ...(appearance.shape && { shape: appearance.shape }),
    ...(appearance.size && { size: appearance.size }),
    ...(appearance.tone && { tone: appearance.tone }),
    ...(appearance.fill && { fill: appearance.fill }),
    ...(appearance.description?.lines !== undefined && {
      maxLines: appearance.description.lines,
    }),
    ...(appearance.description?.size !== undefined && {
      descSize: appearance.description.size,
    }),

    ...(layout.minWidth !== undefined && {
      minWidth: Number(layout.minWidth),
    }),
    ...(appearance.theme && { theme: appearance.theme }),
    ...(layout.position && { position: layout.position }),
    ...(layout.width !== undefined && { width: Number(layout.width) }),
    ...(layout.mobileWidth !== undefined && {
      mobileWidth: Number(layout.mobileWidth),
    }),
    ...(layout.gap !== undefined && { gap: layout.gap }),
    ...(layout.offset !== undefined && { offset: Number(layout.offset) }),
    ...(layout.visibleToasts !== undefined && {
      visibleToasts: layout.visibleToasts,
    }),
    ...(layout.expand !== undefined && { expand: layout.expand }),
    ...(behaviour.duration !== undefined && { duration: behaviour.duration }),
    ...(behaviour.closeButton !== undefined && {
      closeButton: behaviour.closeButton,
    }),
    ...(behaviour.closeButtonShape && {
      closeButtonShape: behaviour.closeButtonShape,
    }),
  };
}

/** The props the lab actually renders — explicit groups only, no preset. */
export function toToasterProps(config: LabConfig): ToasterProps {
  const description = {
    ...(config.descSize !== "auto" && { size: config.descSize }),
    ...(config.maxLines > 0 && { lines: config.maxLines }),
  };

  return {
    animation: config.animation,
    ...(config.progress && {
      progress: { visible: true, position: config.progressPosition },
    }),
    appearance: {
      shape: config.shape,
      size: config.size,
      tone: config.tone,
      fill: config.fill,
      ...(Object.keys(description).length > 0 && { description }),
      theme: config.theme,
    },
    layout: {
      position: config.position,
      width: config.width,
      ...(config.minWidth > 0 && { minWidth: config.minWidth }),
      mobileWidth: config.mobileWidth,
      gap: config.gap,
      offset: config.offset,
      visibleToasts: config.visibleToasts,
      expand: config.expand,
    },
    behaviour: {
      duration: config.duration,
      closeButton: config.closeButton,
      closeButtonShape: config.closeButtonShape,
    },
  };
}

/** The same props as something you can paste into a page. */
export function snippet(config: LabConfig): string {
  const appearance = [
    `shape: "${config.shape}"`,
    `size: "${config.size}"`,
    `tone: "${config.tone}"`,
    `fill: "${config.fill}"`,
    `theme: "${config.theme}"`,
  ].join(", ");

  return [
    "<Toaster",
    `  appearance={{ ${appearance} }}`,
    `  layout={{ position: "${config.position}", width: ${config.width}, mobileWidth: ${config.mobileWidth}, gap: ${config.gap}, offset: ${config.offset}, visibleToasts: ${config.visibleToasts}${config.expand ? ", expand: true" : ""} }}`,
    `  behaviour={{ duration: ${config.duration}, closeButton: ${config.closeButton}, closeButtonShape: "${config.closeButtonShape}" }}`,
    "/>",
  ].join("\n");
}
