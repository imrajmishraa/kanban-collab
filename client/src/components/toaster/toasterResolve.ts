import type { ToastClassnames } from "sonner";

import { TONE_SURFACE, TOAST_MS, type CssVars } from "@/lib/toastTokens";

import {
  DEFAULT_WIDTH_PX,
  MOBILE_WIDTH,
  MOBILE_WIDTH_PX,
  PRESET,
  SHAPE_CLASS,
  SIZE_CLASS,
  SURFACE,
  dimension,
  type BehaviourOptions,
  type ToasterTheme,
  type LayoutOptions,
  type ToasterProps,
} from "./toasterVariants";

/**
 * Every number and class the toaster renders, derived from the props in one pure
 * function.
 *
 * No React, no sonner: `AGENTS.md` §4 asks for the tangled part to be a pure
 * function so it can be tested in the node environment, and this is that part.
 * The component below it only builds elements from this result.
 */

export interface ResolvedToaster {
  id?: string;
  position: NonNullable<LayoutOptions["position"]>;
  theme: ToasterTheme;
  closeButton: boolean;
  expand: boolean;
  visibleToasts: number;
  duration: number;
  gap: number;
  offset: NonNullable<LayoutOptions["offset"]>;
  mobileOffset: NonNullable<LayoutOptions["mobileOffset"]>;
  swipeDirections: NonNullable<BehaviourOptions["swipeDirections"]>;
  hotkey: NonNullable<BehaviourOptions["hotkey"]>;
  containerAriaLabel: string;
  /** Only set when the caller names a single toast; sonner prefers it over the
   * stack label, so a default here would hide the hotkey hint. */
  customAriaLabel?: string;
  closeButtonAriaLabel: string;
  /** Everything sonner paints each toast with. */
  toastStyle: CssVars;
  /** Every class sonner puts on each toast, by slot. */
  classNames: ToastClassnames;
  /** The toaster's own element — offsets and the mobile cap live here. */
  rootClass: string;
}

/** The hairline of light plus the deep drop. One blur reads as a browser default. */
const SHADOW =
  "!shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_24px_56px_-20px_rgba(0,0,0,0.75),0_2px_8px_-2px_rgba(0,0,0,0.5)]";

const TRANSITION =
  "!transition-[transform,opacity] !duration-300 !ease-[cubic-bezier(0.21,0.47,0.32,0.98)]";

/**
 * The dismiss button, in the flow rather than on top of it.
 *
 * Sonner's toast is already `display: flex; align-items: center`, so a static
 * button is centred by the layout for any content height. It is also rendered as
 * the toast's *first* child, so `!order-last` is what keeps it at the right edge,
 * and `!transform-none` cancels sonner's `translate(-35%, -35%)`.
 */
const CLOSE_BUTTON = [
  "!static !transform-none !shrink-0 !order-last",
  "!size-6 !border-0 !bg-transparent !text-(--toast-close)",
  "!transition-colors !duration-150",
  "hover:!bg-(--tint-8) hover:!text-(--normal-text)",
  "[&_svg]:!size-4",
];

/**
 * The action and cancel buttons are 44px tall below `sm` and 28px above it.
 * `change-rules.md` §5.1 sets the touch floor at 44×44 and calls `h-8` a
 * miss-tap; the desktop height is what the design asks for. Both sizes, one
 * control.
 */
const ACTION_BUTTON = [
  "!h-11 !rounded-md !bg-(--brand) !px-3",
  "!text-[12px] !font-semibold !text-(--solid-text)",
  "sm:!h-7 sm:!px-2.5",
].join(" ");

const CANCEL_BUTTON = [
  "!h-11 !rounded-md !bg-(--tint-8) !px-3",
  "!text-[12px] !font-medium !text-(--text-secondary)",
  "sm:!h-7 sm:!px-2.5",
].join(" ");

const join = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

/** Preset first, explicit group second — the caller always wins. */
const merge = <T extends object>(base?: T, override?: T): T =>
  ({ ...base, ...override }) as T;

export function resolveToaster(props: ToasterProps = {}): ResolvedToaster {
  const preset = PRESET[props.preset ?? "default"];

  const appearance = merge(preset.appearance, props.appearance);
  const layout = merge(preset.layout, props.layout);
  const behaviour = merge(preset.behaviour, props.behaviour);
  const a11y = merge(preset.a11y, props.a11y);

  const {
    shape = "default",
    size = "md",
    tone = "auto",
    theme = "dark",
  } = appearance;

  const {
    position = "bottom-right",
    width = DEFAULT_WIDTH_PX,
    maxWidth,
    mobileWidth = MOBILE_WIDTH_PX,
    height,
    maxHeight,
    gap = 10,
    offset = 16,
    mobileOffset = 12,
    expand = false,
    visibleToasts = 3,
  } = layout;

  const {
    duration = TOAST_MS.default,
    closeButton = true,
    closeButtonShape = "md",
    swipeDirections = ["right", "top"],
    hotkey = ["altKey", "KeyT"],
  } = behaviour;

  const {
    containerLabel = "Notifications",
    toastLabel,
    closeLabel = "Dismiss notification",
  } = a11y;

  const { toaster, ...toastClassNames } = props.classNames ?? {};
  const scale = SIZE_CLASS[size];

  const toastStyle: CssVars = {
    ...SURFACE,
    "--width": dimension(width) ?? `${DEFAULT_WIDTH_PX}px`,
    "--toast-mobile-width": dimension(mobileWidth) ?? `${MOBILE_WIDTH_PX}px`,
    ...TONE_SURFACE[tone],
    ...(height !== undefined && { "--toast-min-height": dimension(height) }),
    ...(maxHeight !== undefined && {
      "--toast-max-height": dimension(maxHeight),
    }),
    ...(maxWidth !== undefined && { "--toast-max-width": dimension(maxWidth) }),
  };

  const classNames: ToastClassnames = {
    toast: join(
      "!font-sans",
      SHAPE_CLASS[shape],
      toastClassNames.toast,
      height !== undefined && "!min-h-[var(--toast-min-height)]",
      maxHeight !== undefined && "!max-h-[var(--toast-max-height)]",
      maxWidth !== undefined && "!max-w-[var(--toast-max-width)]",
      SHADOW,
      TRANSITION,
    ),
    title: join(scale.title, toastClassNames.title),
    description: join(scale.description, toastClassNames.description),
    content: join("!gap-1", toastClassNames.content),
    icon: join("!size-6 !items-center !justify-center", toastClassNames.icon),
    loader: join("!text-(--text-secondary)", toastClassNames.loader),
    actionButton: join(ACTION_BUTTON, toastClassNames.actionButton),
    cancelButton: join(CANCEL_BUTTON, toastClassNames.cancelButton),
    closeButton: join(
      ...CLOSE_BUTTON,
      closeButtonShape === "round" ? "!rounded-full" : "!rounded-md",
      toastClassNames.closeButton,
    ),
  };

  return {
    ...(props.id !== undefined && { id: props.id }),
    position,
    theme,
    closeButton,
    expand,
    visibleToasts,
    duration,
    gap,
    offset,
    mobileOffset,
    swipeDirections,
    hotkey,
    containerAriaLabel: containerLabel,
    ...(toastLabel !== undefined && { customAriaLabel: toastLabel }),
    closeButtonAriaLabel: closeLabel,
    toastStyle,
    classNames,
    rootClass: join(MOBILE_WIDTH, toaster),
  };
}
