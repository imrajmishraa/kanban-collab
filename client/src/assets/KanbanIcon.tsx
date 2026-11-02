import { useId } from "react";

/** Which half of the mark carries the lit orange. */
export type KibanaVariant = "upper" | "bottom";

interface KibanaIconProps {
  /** Rendered width and height in px. */
  size?: number;
  className?: string;
  title?: string;
  theme?: "auto" | "light" | "dark";
  ink?: string;
  variant?: KibanaVariant;
}

/* One path for the whole top triangle. Drawing it as two — a stem and an arm
   meeting at x=7 — leaves a hairline where their anti-aliased edges overlap. */
const UPPER = "M2.625 0H21.375L2.625 21.591z";
const WEDGE = "M13.489 12.47 3.477 24h17.522a18.755 18.755 0 0 0-7.51-11.53z";

/**
 * The Kibana mark, lit the way the "Get Started" pill is lit.
 *
 * One half carries the brand orange as tinted glass with a white sheen over
 * it; the other half takes `currentColor`, so it is near-black on the light
 * page and white on the dark one without either being hard-coded here.
 *
 * Both gradients use `userSpaceOnUse`, so a lit area made of two paths shares
 * one continuous ramp instead of restarting at each path's own bounding box.
 *
 * The ink is the SVG `color` presentation attribute rather than a class: a
 * presentation attribute loses to any CSS, so a caller passing
 * `className="text-(--brand)"` still wins.
 */
export function KanbanIcon({
  size = 24,
  className,
  title,
  theme = "auto",
  ink,
  variant = "upper",
}: KibanaIconProps) {
  const labelled = Boolean(title);
  const litIsUpper = variant === "upper";

  /* A pinned theme replaces `currentColor` with a literal, so the ink stops
     responding to the page entirely — that is the whole point of pinning it. */
  const themedInk =
    theme === "light"
      ? "#0D0D0D"
      : theme === "dark"
        ? "#F5F5F5"
        : "currentColor";

  const bandFill = ink ?? themedInk;

  /* Only "auto" reads the page token; a pinned theme must not. */
  const followsTheme = theme === "auto" && !ink;

  /* Gradient ids have to be unique per instance: two icons on one page with
     the same id would both paint the first one's gradient. */
  const uid = useId().replace(/[:]/g, "");
  const glass = `kb-glass-${uid}`;
  const sheen = `kb-sheen-${uid}`;

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      color={followsTheme ? "var(--text-primary)" : undefined}
      xmlns="http://www.w3.org/2000/svg"
      role={labelled ? "img" : undefined}
      aria-label={title}
      aria-hidden={labelled ? undefined : true}
      focusable="false"
    >
      <defs>
        {/* The tinted glass: brand orange, deepening toward the bottom. */}
        <linearGradient
          id={glass}
          gradientUnits="userSpaceOnUse"
          x1={litIsUpper ? "2.625" : "3.477"}
          y1={litIsUpper ? "0" : "12.47"}
          x2={litIsUpper ? "12" : "14"}
          y2="24"
        >
          <stop offset="0%" stopColor="#FF9E5E" stopOpacity="1" />
          <stop offset="50%" stopColor="#FF6A42" stopOpacity="1" />
          <stop offset="100%" stopColor="#F2600F" stopOpacity="0.92" />
        </linearGradient>

        {/* The ambient light: a white wash from the top edge, fading out. */}
        <linearGradient
          id={sheen}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={litIsUpper ? "0" : "12.47"}
          x2="0"
          y2="24"
        >
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.26" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {litIsUpper ? (
        <>
          {/* Lit: the whole top triangle. */}
          <path d={UPPER} fill={`url(#${glass})`} />
          <path d={UPPER} fill={`url(#${sheen})`} />

          {/* Unlit: the wedge. */}
          <path d={WEDGE} fill={bandFill} />
        </>
      ) : (
        <>
          {/* Unlit: the top triangle. */}
          <path d={UPPER} fill={bandFill} />

          {/* Lit: the wedge only. */}
          <path d={WEDGE} fill={`url(#${glass})`} />
          <path d={WEDGE} fill={`url(#${sheen})`} />
        </>
      )}
    </svg>
  );
}

export default KanbanIcon;
