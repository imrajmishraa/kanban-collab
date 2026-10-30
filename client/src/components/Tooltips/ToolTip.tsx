import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type Side = "top" | "bottom" | "left" | "right";
type Align = "left" | "center" | "right";

const DEFAULT_GAP = 8; // bubble ↔ anchor
const MARGIN = 8; // viewport safe area

const ORIGIN: Record<Side, string> = {
  top: "center bottom",
  bottom: "center top",
  left: "right center",
  right: "left center",
};

/** Hover-capable devices only, prevents ghost tooltips after taps on touch. */
const canHover =
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/* ── Bubble shapes ───────────────────────────────────────────────
   Classic five : default · sharp · soft · pill · card
   Creative set : glass · neon · gradient · ink · outline · terminal · badge
   Editorial    : solid, the "Toggle side panel" look: black capsule,
                  white text, soft floating shadow. The timeless one. */

export type TooltipShape =
  | "default"
  | "sharp"
  | "soft"
  | "pill"
  | "card"
  | "glass"
  | "neon"
  | "gradient"
  | "ink"
  | "outline"
  | "terminal"
  | "badge"
  | "solid";

/* Shape classes merge BEFORE tone/size but AFTER the base fill/text/shadow,
   so every variant can override the base, and tone can override shape. */

const SHAPE_CLASS: Record<TooltipShape, string> = {
  /* ChaiUI material rules applied to every bubble:
     near-black surface, warm hairline (orange-50/15), no shadow.
     Orange is never a fill, so the "loud" shapes use a cream tint and a
     hairline instead of an orange background. */

  /* ── Classic five ── */
  default: "rounded-lg px-2.5 py-1",
  sharp: "rounded-[3px] px-2.5 py-1",
  soft: "rounded-xl px-3 py-1.5",
  pill: "rounded-full px-3.5 py-1",
  card: "rounded-xl px-3.5 py-2.5",

  /* ── Creative set ── */

  // Frosted: warm white wash over the near-black surface
  glass: [
    "rounded-xl px-3 py-1.5",
    "border-(--hairline-strong) bg-(--tint-6) backdrop-blur-md",
    "text-(--text-primary)",
  ].join(" "),

  // Cream ring: the one bubble that carries the highlight accent
  neon: [
    "rounded-lg px-3 py-1.5",
    "border-(--accent-soft) bg-(--accent-soft) text-(--accent)",
  ].join(" "),

  // Cream wash: solid-looking without being an orange fill
  gradient: [
    "rounded-lg px-3 py-1.5 font-medium",
    "border-(--accent-soft) bg-(--accent-soft) text-(--accent)",
  ].join(" "),

  // Ink: inverted paper, the only light bubble
  ink: [
    "rounded-md px-2.5 py-1",
    "border-(--hairline) bg-(--bg-root) text-(--text-primary)",
  ].join(" "),

  // Outline: hairline only
  outline: [
    "rounded-md px-2.5 py-1",
    "border-(--hairline-strong) bg-transparent text-(--text-soft)",
  ].join(" "),

  // Terminal: mono data label, quiet surface
  terminal: [
    "rounded-[4px] px-2.5 py-1",
    "border-(--hairline) bg-(--bg-card)",
    "font-mono text-[10px] tracking-wider text-(--text-muted)",
  ].join(" "),

  // Badge: cream tint pill, text carries the accent
  badge: [
    "rounded-full px-3.5 py-1",
    "border-(--accent-soft) bg-(--accent-soft) text-(--accent) font-medium",
  ].join(" "),

  /* ── Editorial ── */

  // Solid: the capsule every call site uses. Black, white text, warm hairline,
  // flat on purpose (ChaiUI cards carry no shadow).
  solid: [
    "rounded-[10px] px-3 py-1.5",
    "border border-(--hairline) bg-black/95 text-(--text-primary) backdrop-blur-sm",
  ].join(" "),
};

/* ── Colour tones, a semantic layer that sits ON TOP of any shape.────
   Use tone for MEANING (this board is archived, this action deletes),
   use shape for VOICE (quiet glass vs loud neon). They compose. */

export type TooltipTone =
  "neutral" | "brand" | "success" | "warning" | "danger";

const TONE_CLASS: Record<TooltipTone, string> = {
  neutral: "",
  // Cream, the highlight accent. Never an orange fill.
  brand: "border-(--accent-soft) text-(--accent)",
  success: "border-(--success)/30 text-(--success)",
  warning: "border-(--warning)/30 text-(--warning)",
  danger: "border-(--danger)/30 text-(--danger)",
};

/* The little rotated-square tail must match its bubble's fill,
   or every non-default shape would wear a mismatched arrow. */

const ARROW_CLASS: Record<TooltipShape, string> = {
  default: "border-(--hairline) bg-black/95",
  sharp: "border-(--hairline) bg-black/95",
  soft: "border-(--hairline) bg-black/95",
  pill: "border-(--hairline) bg-black/95",
  card: "border-(--hairline) bg-black/95",
  glass: "border-(--hairline-strong) bg-(--tint-6)",
  neon: "border-(--accent-soft) bg-(--accent-soft)",
  gradient: "border-(--accent-soft) bg-(--accent-soft)",
  ink: "border-(--hairline) bg-(--bg-root)",
  outline: "border-(--hairline-strong) bg-transparent",
  terminal: "border-(--hairline) bg-(--bg-card)",
  badge: "border-(--accent-soft) bg-(--accent-soft)",
  solid: "border-(--hairline) bg-black/95",
};

const ARROW_TONE_CLASS: Record<TooltipTone, string> = {
  neutral: "",
  brand: "border-(--accent-soft)",
  success: "border-(--success)/30",
  warning: "border-(--warning)/30",
  danger: "border-(--danger)/30",
};

/* ── Typography scale, the bubble's voice, independent of shape. ── */

export type TooltipSize = "sm" | "md" | "lg";

const SIZE_CLASS: Record<TooltipSize, string> = {
  sm: "text-[10px]",
  md: "text-[11px]",
  lg: "text-[13px]",
};

interface TooltipProps {
  /** Bubble content, string, or any node for icon + label combos. */
  label: ReactNode;
  /** Preferred side, flips automatically when there's no room. */
  side?: Side;
  children: ReactNode;
  className?: string;
  /** ms before showing on hover (default 180) */
  delay?: number;
  /** grace period before hiding, allows gliding between anchors (default 80) */
  hideDelay?: number;
  disabled?: boolean;
  /** Fixed bubble width (number = px, or any CSS length). Enables wrapping. */
  width?: number | string;
  /** Max bubble width. Enables wrapping. */
  maxWidth?: number | string;
  /** Fixed bubble height, content centers vertically. */
  height?: number | string;
  /** Max bubble height, content clips gracefully. */
  maxHeight?: number | string;
  /** Text alignment when the bubble wraps (default: left) */
  align?: Align;
  /** Pre-defined bubble shape (default: 'default', the original look) */
  shape?: TooltipShape;
  /** Semantic colour layer on top of the shape (default: 'neutral') */
  tone?: TooltipTone;
  /** Typography scale (default: 'md') */
  size?: TooltipSize;
  /** Show the arrow tail. 'none' hides it (default: 'auto') */
  caret?: "auto" | "none";
  /**
   * One cream highlight phrase, ChaiUI's signature accent, rendered after the
   * label. Keep it to a short phrase: it is the only accent in the bubble.
   */
  highlight?: ReactNode;
  /** px between anchor and bubble (default 8) */
  gap?: number;
  /**
   * Extra classes merged into the BUBBLE itself (not the wrapper span).
   * NOTE: the bubble is portalled to document.body, so it does NOT
   * inherit styles from `className`, use this for per-usage tweaks.
   * Merged last, so it overrides everything.
   */
  bubbleClassName?: string;
}

interface Placement {
  side: Side;
  style: CSSProperties;
  arrow: CSSProperties;
}

const px = (v: number | string) => (typeof v === "number" ? `${v}px` : v);

export function Tooltip({
  label,
  side = "bottom",
  children,
  className,
  delay = 180,
  hideDelay = 80,
  disabled = false,
  width,
  height,
  maxWidth,
  maxHeight,
  align = "left",
  shape = "default",
  tone = "neutral",
  size = "md",
  caret = "auto",
  highlight,
  gap = DEFAULT_GAP,
  bubbleClassName,
}: TooltipProps) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const showTimer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);
  const touchTimer = useRef<number | null>(null);

  const [open, setOpen] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [pos, setPos] = useState<Placement | null>(null);
  const id = useId();

  const bubbleStyle: CSSProperties = {
    ...(width !== undefined && { width: px(width) }),
    ...(maxWidth !== undefined && { maxWidth: px(maxWidth) }),
    ...(height !== undefined && { height: px(height) }),
    ...(maxHeight !== undefined && { maxHeight: px(maxHeight) }),
  };

  /* ── Measure anchor + bubble, pick the best side, clamp to viewport ── */
  const place = useCallback(() => {
    if (!wrapRef.current || !bubbleRef.current) return;

    const anchor = wrapRef.current.getBoundingClientRect();
    const el = bubbleRef.current;
    const bw = el.offsetWidth;
    const bh = el.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const cx = anchor.left + anchor.width / 2;
    const cy = anchor.top + anchor.height / 2;

    const space: Record<Side, number> = {
      top: anchor.top,
      bottom: vh - anchor.bottom,
      left: anchor.left,
      right: vw - anchor.right,
    };

    let s: Side = side;
    if (space[side] < bh + gap) {
      s = (Object.keys(space) as Side[]).reduce((a, b) =>
        space[b] > space[a] ? b : a,
      );
    }

    let top: number;
    let left: number;
    if (s === "bottom") {
      top = anchor.bottom + gap;
      left = cx - bw / 2;
    } else if (s === "top") {
      top = anchor.top - bh - gap;
      left = cx - bw / 2;
    } else if (s === "right") {
      left = anchor.right + gap;
      top = cy - bh / 2;
    } else {
      left = anchor.left - bw - gap;
      top = cy - bh / 2;
    }

    left = Math.min(Math.max(left, MARGIN), Math.max(vw - bw - MARGIN, MARGIN));
    top = Math.min(Math.max(top, MARGIN), Math.max(vh - bh - MARGIN, MARGIN));

    const clamp = (v: number, size: number) =>
      Math.min(Math.max(v, 2), Math.max(size - 10, 2));

    let arrow: CSSProperties;
    if (s === "bottom") arrow = { top: -4, left: clamp(cx - left - 4, bw) };
    else if (s === "top")
      arrow = { bottom: -4, left: clamp(cx - left - 4, bw) };
    else if (s === "right") arrow = { left: -4, top: clamp(cy - top - 4, bh) };
    else arrow = { right: -4, top: clamp(cy - top - 4, bh) };

    setPos({
      side: s,
      style: { top, left, transformOrigin: ORIGIN[s] },
      arrow,
    });
    setPlaced(true);
  }, [side, gap]);

  /* ── Show / hide choreography ─────────────────────────────────── */

  const clearPending = useCallback(() => {
    if (showTimer.current !== null) window.clearTimeout(showTimer.current);
    if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
    if (touchTimer.current !== null) window.clearTimeout(touchTimer.current);
    showTimer.current = null;
    hideTimer.current = null;
    touchTimer.current = null;
  }, []);

  const show = useCallback(() => {
    if (disabled) return;
    if (hideTimer.current !== null) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    if (showTimer.current !== null || open) return;
    showTimer.current = window.setTimeout(() => {
      showTimer.current = null;
      setOpen(true);
    }, delay);
  }, [delay, disabled, open]);

  const hide = useCallback(() => {
    if (showTimer.current !== null) {
      window.clearTimeout(showTimer.current);
      showTimer.current = null;
    }
    if (hideTimer.current !== null) return; // already leaving
    hideTimer.current = window.setTimeout(() => {
      hideTimer.current = null;
      setOpen(false);
      setPlaced(false);
    }, hideDelay);
  }, [hideDelay]);

  const hideNow = useCallback(() => {
    clearPending();
    setOpen(false);
    setPlaced(false);
  }, [clearPending]);

  useEffect(() => clearPending, [clearPending]);

  /* ── Place before paint, and RE-PLACE on scroll (instead of vanishing) ── */
  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    let raf: number | null = null;
    const reposition = () => {
      if (raf !== null) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        place();
      });
    };
    window.addEventListener("scroll", reposition, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, { capture: true });
      window.removeEventListener("resize", reposition);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [open, place]);

  /* ── Accessible trigger: forward aria-describedby to the child ── */
  const trigger = (() => {
    if (disabled || !isValidElement(children)) return children;
    const child = children as ReactElement<{ "aria-describedby"?: string }>;
    const existing = child.props["aria-describedby"];
    return cloneElement(child, {
      "aria-describedby": existing ? `${existing} ${id}` : id,
    });
  })();

  /* Hover handlers only on hover-capable devices, no ghost tooltips on phones */
  const hoverProps = canHover ? { onMouseEnter: show, onMouseLeave: hide } : {};

  return (
    <span
      ref={wrapRef}
      className={cn("relative inline-flex", className)}
      {...hoverProps}
      onFocus={(e) => {
        if (
          e.target instanceof HTMLElement &&
          e.target.matches(":focus-visible")
        )
          show();
      }}
      onBlur={hide}
      onKeyDown={(e) => {
        if (e.key === "Escape") hideNow();
      }}
      /* Touch: long-press (500ms) shows, any movement or lift dismisses */
      onTouchStart={() => {
        if (disabled) return;
        if (touchTimer.current !== null) return;
        touchTimer.current = window.setTimeout(() => {
          touchTimer.current = null;
          setOpen(true);
        }, 500);
      }}
      onTouchMove={() => {
        if (touchTimer.current !== null) {
          window.clearTimeout(touchTimer.current);
          touchTimer.current = null;
        }
        hideNow();
      }}
      onTouchEnd={() => {
        if (touchTimer.current !== null) {
          window.clearTimeout(touchTimer.current);
          touchTimer.current = null;
        }
        hideNow();
      }}
      onTouchCancel={() => {
        if (touchTimer.current !== null) {
          window.clearTimeout(touchTimer.current);
          touchTimer.current = null;
        }
        hideNow();
      }}
    >
      {trigger}

      {open &&
        !disabled &&
        createPortal(
          <span
            ref={bubbleRef}
            id={id}
            role="tooltip"
            style={{
              ...bubbleStyle,
              ...(placed && pos ? pos.style : { visibility: "hidden" }),
            }}
            className={cn(
              "pointer-events-none fixed z-999",
              "max-w-[min(60vw,18rem)] whitespace-normal",
              height !== undefined && "flex items-center overflow-hidden",
              maxHeight !== undefined && "overflow-hidden",
              /* ChaiUI base surface: near-black, warm hairline, flat. No shadow,
                 which is why the border has to carry the separation. */
              "border border-(--hairline) bg-black/95 backdrop-blur-sm",
              "text-[11px] font-medium tracking-[0.01em] text-(--text-primary)",
              align === "center" && "text-center",
              align === "right" && "text-right",
              /* Shape classes come AFTER the base fill/text/shadow
                 so creative variants can override all of them;
                 tone and size then layer on top of shape. */
              SHAPE_CLASS[shape],
              TONE_CLASS[tone],
              SIZE_CLASS[size],
              /* 200ms sits inside ChaiUI's 200 to 300ms band. */
              "transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
              "motion-reduce:transition-none",
              placed
                ? "scale-100 opacity-100"
                : "scale-[0.96] opacity-0 motion-reduce:scale-100",
              bubbleClassName,
            )}
          >
            {label}
            {highlight ? (
              <span className="ml-1 font-medium text-(--accent) capitalize">
                {highlight}
              </span>
            ) : null}
            {caret !== "none" && (
              <span
                aria-hidden
                style={placed ? pos?.arrow : undefined}
                className={cn(
                  "absolute size-2 rotate-45 rounded-[3px]",
                  ARROW_CLASS[shape],
                  ARROW_TONE_CLASS[tone],
                  pos?.side === "bottom" && "border-t border-l",
                  pos?.side === "top" && "border-r border-b",
                  pos?.side === "right" && "border-b border-l",
                  pos?.side === "left" && "border-t border-r",
                )}
              />
            )}
          </span>,
          document.body,
        )}
    </span>
  );
}
