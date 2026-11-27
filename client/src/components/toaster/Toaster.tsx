import type { ReactNode } from "react";

import { Toaster as SonnerToaster } from "sonner";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Alert02Icon,
  AlertDiamondIcon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";

import { resolveToaster } from "./toasterResolve";
import type { ToasterIconName, ToasterProps } from "./toasterVariants";

export type {
  A11yOptions,
  AppearanceOptions,
  BehaviourOptions,
  LayoutOptions,
  ToasterClassNames,
  ToasterIconName,
  ToasterPosition,
  ToasterPreset,
  ToasterProps,
  ToasterShape,
  ToasterSize,
  ToasterTheme,
  ToasterTone,
} from "./toasterVariants";

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
 * The app's toast stack.
 *
 * Seven props, and every attribute lives inside one of them: `appearance` paints,
 * `layout` measures, `behaviour` times, `a11y` labels, `classNames` reaches the
 * slots sonner names, `preset` fills several at once and `id` names the stack.
 * `docs/change-rules.md` §3.3 caps a component at eight props — a flat list of
 * twenty was over it, and one more boolean would have made that worse.
 *
 * All the arithmetic is in `toasterResolve.ts`, a pure function with no React in
 * it. This file builds elements and nothing else.
 */
export function Toaster(props: ToasterProps = {}) {
  const resolved = resolveToaster(props);
  const overrides = props.appearance?.icons;

  /**
   * An icon the caller *set* wins, including `null`.
   *
   * sonner's contract is that `null` removes the icon, and `??` cannot express
   * it: `null ?? fallback` puts the default badge back. `Object.hasOwn` rather
   * than `in`, because `in` also matches `constructor` and `__proto__`
   * (`AGENTS.md` §4, the trap that was found twice).
   */
  const icon = (name: ToasterIconName, fallback: ReactNode) =>
    overrides !== undefined && Object.hasOwn(overrides, name)
      ? overrides[name]
      : fallback;

  return (
    <SonnerToaster
      {...(resolved.id !== undefined && { id: resolved.id })}
      position={resolved.position}
      theme={resolved.theme}
      closeButton={resolved.closeButton}
      richColors={false}
      expand={resolved.expand}
      visibleToasts={resolved.visibleToasts}
      duration={resolved.duration}
      gap={resolved.gap}
      offset={resolved.offset}
      mobileOffset={resolved.mobileOffset}
      swipeDirections={resolved.swipeDirections}
      hotkey={resolved.hotkey}
      containerAriaLabel={resolved.containerAriaLabel}
      {...(resolved.customAriaLabel !== undefined && {
        customAriaLabel: resolved.customAriaLabel,
      })}
      className={resolved.rootClass}
      icons={{
        success: icon("success", <IconBadge tone="success" />),
        error: icon("error", <IconBadge tone="error" />),
        warning: icon("warning", <IconBadge tone="warning" />),
        info: icon("info", <IconBadge tone="info" />),
        loading: icon("loading", <IconBadge tone="loading" />),
        ...(overrides !== undefined && Object.hasOwn(overrides, "close")
          ? { close: overrides.close }
          : {}),
      }}
      toastOptions={{
        unstyled: false,
        closeButtonAriaLabel: resolved.closeButtonAriaLabel,
        style: resolved.toastStyle,
        classNames: resolved.classNames,
        ...(resolved.descriptionClassName !== undefined && {
          descriptionClassName: resolved.descriptionClassName,
        }),
      }}
    />
  );
}
