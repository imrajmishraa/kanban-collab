import type { CSSProperties } from "react";
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

/**
 * Sonner stops reading `--width` below 600px: its own media query makes the
 * toaster full-bleed and gives each toast `calc(100% - 2 × mobileOffset)`. So
 * the mobile width cannot be another `--width` value — it has to be a cap on
 * the toast itself, at sonner's breakpoint rather than Tailwind's `sm` (640px),
 * or the 600–640px band would shrink a desktop toast.
 */
const MOBILE_WIDTH = [
  "[@media(max-width:600px)]:[&_[data-sonner-toast]]:!mx-auto",
  "[@media(max-width:600px)]:[&_[data-sonner-toast]]:!max-w-[340px]",
].join(" ");

/**
 * What sonner reads for the surface.
 *
 * `--normal-bg` takes an image as well as a colour, so it carries a gradient:
 * four percent of the ink at the top edge falling into the elevated surface.
 * That highlight is the difference between a panel and a slab — it is the same
 * trick `m-card` uses, at toast scale.
 */
const SURFACE = {
  "--normal-bg":
    "linear-gradient(to bottom, color-mix(in srgb, var(--text-primary) 5%, var(--bg-elevated)), var(--bg-elevated) 62%)",
  "--normal-border": "var(--border)",
  "--normal-text": "var(--text-primary)",
  "--border-radius": "12px",
  "--width": "380px",
} as CSSProperties;

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      theme="dark"
      closeButton
      richColors={false}
      expand={false}
      visibleToasts={3}
      duration={4000}
      gap={10}
      offset={{ top: 16, right: 16, bottom: 16, left: 16 }}
      mobileOffset={{ top: 12, right: 12, bottom: 12, left: 12 }}
      swipeDirections={["right", "top"]}
      hotkey={["altKey", "KeyT"]}
      containerAriaLabel="Notifications"
      className={MOBILE_WIDTH}
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
        style: SURFACE,
        classNames: {
          toast: [
            "!font-sans",
            // Two shadows, not one: a hairline of light on the top edge and a
            // deep, wide drop. A single blur reads as a browser default.
            "!shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_24px_56px_-20px_rgba(0,0,0,0.75),0_2px_8px_-2px_rgba(0,0,0,0.5)]",
            "!transition-[transform,opacity] !duration-300 !ease-[cubic-bezier(0.21,0.47,0.32,0.98)]",
          ].join(" "),
          title:
            "!text-[13px] !font-semibold !leading-[1.35] !tracking-[-0.1px]",
          description:
            "!text-[12px] !leading-[1.5] !tracking-[-0.05px] !text-(--text-muted)",
          content: "!gap-1",
          icon: "!size-6 !items-center !justify-center",
          actionButton:
            "!h-7 !rounded-md !bg-(--brand) !px-2.5 !text-[12px] !font-semibold !text-(--solid-text)",
          cancelButton:
            "!h-7 !rounded-md !bg-(--tint-8) !px-2.5 !text-[12px] !font-medium !text-(--text-secondary)",
          closeButton:
            "!size-[18px] !bg-(--bg-elevated) !text-(--text-muted) !transition-colors !duration-150 hover:!bg-(--tint-8) hover:!text-(--text-primary)",
          loader: "!text-(--text-secondary)",
        },
      }}
    />
  );
}
