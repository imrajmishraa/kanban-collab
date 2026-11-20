import {
  MOBILE_WIDTH,
  SHAPE_CLASS,
  SIZE_CLASS,
  SURFACE,
  SURFACE_BY_TONE,
  dimension,
  type ToasterPosition,
  type ToasterShape,
  type ToasterSize,
  type ToasterTheme,
  type CssVars,
  type ToasterTone,
} from "./toasterVariants";
import { Toaster as SonnerToaster } from "sonner";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Alert02Icon,
  AlertDiamondIcon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";

/**
 * The status colour a toast is lit with, in two forms: the class its icon takes
 * and the raw token its disc is tinted from.
 *
 * Colour is information here, not decoration: the tint never fills the surface,
 * it only edges it (a 2px rail) and backs the icon.
 */
const TONE = {
  success: { ink: "text-(--success)", token: "var(--success)" },
  error: { ink: "text-(--danger)", token: "var(--danger)" },
  warning: { ink: "text-(--warning)", token: "var(--warning)" },
  info: { ink: "text-(--brand)", token: "var(--brand)" },
  loading: { ink: "text-(--text-secondary)", token: "var(--text-secondary)" },
} as const;

type Tone = keyof typeof TONE;

const ICONS: Record<Tone, IconSvgElement> = {
  success: CheckmarkCircle02Icon,
  error: Alert02Icon,
  warning: AlertDiamondIcon,
  info: InformationCircleIcon,
  loading: Loading03Icon,
};

/**
 * The icon in a tinted disc.
 *
 * Sonner draws its own icon in `currentColor`, which means the only colour it
 * can take is the toast's — one colour for the whole surface. Wrapping the glyph
 * in its own disc puts the status colour on the icon alone, and keeps the title
 * in the primary ink where it belongs.
 */
function IconBadge({ tone }: { tone: Tone }) {
  const { ink, token } = TONE[tone];

  return (
    <span
      aria-hidden="true"
      className="grid size-6 place-items-center rounded-full"
      style={{ background: `color-mix(in srgb, ${token} 15%, transparent)` }}
    >
      <HugeiconsIcon
        icon={ICONS[tone]}
        size={13}
        strokeWidth={2.2}
        className={
          tone === "loading"
            ? `${ink} animate-spin motion-reduce:animate-none`
            : ink
        }
      />
    </span>
  );
}

export interface ToasterProps {
  /** Where the stack sits. Default `bottom-right`. */
  position?: ToasterPosition;
  /** `system` follows the app's theme class. Default `dark`. */
  theme?: ToasterTheme;
  /** Type scale inside the toast. Default `md`. */
  size?: ToasterSize;
  /** Corner + padding. Default `default`. */
  shape?: ToasterShape;
  /** Surface colour. Default `auto` (the elevated panel). */
  tone?: ToasterTone;

  /** Fixed stack width — sonner's `--width`. Default `380`. */
  width?: number | string;
  /** Cap on a single toast, in addition to `width`. */
  maxWidth?: number | string;
  /** Minimum height of a toast — useful when every toast should be one size. */
  height?: number | string;
  /** Maximum height; longer content is clipped by sonner's own overflow. */
  maxHeight?: number | string;

  /** Space between stacked toasts. Default `10`. */
  gap?: number;
  /** Distance from the viewport edge. Default `16`. */
  offset?: number;
  /** Same, on narrow screens. Default `12`. */
  mobileOffset?: number;
  /** Show every stacked toast, rather than collapsing them. Default `false`. */
  expand?: boolean;
  /** How many toasts can be on screen at once. Default `3`. */
  visibleToasts?: number;
  /** Default lifetime in ms. Default `4000`. */
  duration?: number;
  /** Show the dismiss button. Default `true`. */
  closeButton?: boolean;
  /** Dismiss button shape: `md` (rounded-md) or `round`. Default `md`. */
  closeButtonShape?: "md" | "round";

  /** Extra classes for the toaster root (offsets, z-index, backdrop). */
  className?: string;
  /** Extra classes for each toast surface — this is where a background goes. */
  toastClassName?: string;
  /** Extra classes for the bubble only, after every variant class. */
  bubbleClassName?: string;
}

export function Toaster({
  position = "bottom-right",
  theme = "dark",
  size = "md",
  shape = "default",
  tone = "auto",
  width = 380,
  maxWidth,
  height,
  maxHeight,
  gap = 10,
  offset = 16,
  mobileOffset = 12,
  expand = false,
  visibleToasts = 3,
  duration = 4000,
  closeButton = true,
  closeButtonShape = "md",
  className,
  toastClassName,
  bubbleClassName,
}: ToasterProps = {}) {
  const scale = SIZE_CLASS[size];

  /* Height caps travel as CSS variables: a Tailwind class built by string
     interpolation would never be generated at build time, and the class list
     here has to stay static. */
  const dimensions: CssVars = {
    ...(height !== undefined && {
      "--toast-min-height": dimension(height),
    }),
    ...(maxHeight !== undefined && {
      "--toast-max-height": dimension(maxHeight),
    }),
    ...(maxWidth !== undefined && { "--toast-max-width": dimension(maxWidth) }),
  };

  return (
    <SonnerToaster
      position={position}
      theme={theme}
      closeButton={closeButton}
      richColors={false}
      expand={expand}
      visibleToasts={visibleToasts}
      duration={duration}
      gap={gap}
      offset={offset}
      mobileOffset={mobileOffset}
      swipeDirections={["right", "top"]}
      hotkey={["altKey", "KeyT"]}
      containerAriaLabel="Notifications"
      className={[MOBILE_WIDTH, className].filter(Boolean).join(" ")}
      icons={{
        success: <IconBadge tone="success" />,
        error: <IconBadge tone="error" />,
        warning: <IconBadge tone="warning" />,
        info: <IconBadge tone="info" />,
        loading: <IconBadge tone="loading" />,
      }}
      toastOptions={{
        unstyled: false,
        closeButtonAriaLabel: "Dismiss notification",
        style: {
          ...SURFACE,
          "--width": dimension(width) ?? "380px",
          ...SURFACE_BY_TONE[tone],
          ...dimensions,
        } as CssVars,
        classNames: {
          toast: [
            "!font-sans",
            SHAPE_CLASS[shape],
            toastClassName ?? "",
            bubbleClassName ?? "",
            height !== undefined && "!min-h-[var(--toast-min-height)]",
            maxHeight !== undefined && "!max-h-[var(--toast-max-height)]",
            maxWidth !== undefined && "!max-w-[var(--toast-max-width)]",
            // Two shadows, not one: a hairline of light on the top edge and a
            // deep, wide drop. A single blur reads as a browser default.
            "!shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_24px_56px_-20px_rgba(0,0,0,0.75),0_2px_8px_-2px_rgba(0,0,0,0.5)]",
            "!transition-[transform,opacity] !duration-300 !ease-[cubic-bezier(0.21,0.47,0.32,0.98)]",
          ]
            .filter(Boolean)
            .join(" "),
          title: scale.title,
          description: scale.description,
          content: "!gap-1",
          icon: "!size-6 !items-center !justify-center",
          actionButton:
            "!h-7 !rounded-md !bg-(--brand) !px-2.5 !text-[12px] !font-semibold !text-(--solid-text)",
          cancelButton:
            "!h-7 !rounded-md !bg-(--tint-8) !px-2.5 !text-[12px] !font-medium !text-(--text-secondary)",
          /*
           * In the flow, not on top of it.
           *
           * Sonner's toast is already `display: flex; align-items: center`, so a
           * static button is centred by the layout for any content height. It is
           * also rendered as the toast's *first* child, so `!order-last` is what
           * keeps it at the right edge. `!transform-none` cancels sonner's
           * `translate(-35%, -35%)`, which applies even when static.
           */
          closeButton: [
            "!static !transform-none !shrink-0 !order-last",
            closeButtonShape === "round" ? "!rounded-full" : "!rounded-md",
            "!size-6 !border-0 !bg-transparent !text-(--text-muted)",
            "!transition-colors !duration-150",
            "hover:!bg-(--tint-8) hover:!text-(--text-primary)",
            "[&_svg]:!size-4",
          ].join(" "),
          loader: "!text-(--text-secondary)",
        },
      }}
    />
  );
}
