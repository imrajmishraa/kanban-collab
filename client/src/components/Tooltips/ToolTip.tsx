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

/** Hover-capable devices only — prevents ghost tooltips after taps on touch. */
const canHover =
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/* ── Bubble shapes ───────────────────────────────────────────────
   Classic five : default · sharp · soft · pill · card
   Creative set : glass · neon · gradient · ink · outline · terminal · badge
   Editorial    : solid — the "Toggle side panel" look: black capsule,
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
  /* ── Classic five (unchanged) ── */
  default: "rounded-md px-2.5 py-1",
  sharp: "rounded-[3px] px-2.5 py-1",
  soft: "rounded-xl px-3 py-1.5",
  pill: "rounded-full px-3.5 py-1",
  card: "rounded-2xl px-3.5 py-2.5",

  /* ── Creative set ── */

  // Frosted glass — translucent blur with a light sheen top-left
  glass: [
    "rounded-xl px-3 py-1.5",
    "border-line backdrop-blur-md",
    "bg-[linear-gradient(135deg,rgba(255,255,255,0.14),rgba(255,255,255,0.03))]",
    "text-ink shadow-none",
  ].join(" "),

  // Neon — brand-tinted glow ring, for the one thing on screen that matters
  neon: [
    "rounded-lg px-3 py-1.5",
    "border-(--brand)/50 bg-(--brand)/10 text-(--brand-hover)",
    "shadow-[0_0_18px_-2px_var(--brand),0_0_5px_var(--brand)]",
  ].join(" "),

  // Gradient — solid brand gradient bubble, white text, heavy lift
  gradient: [
    "rounded-lg px-3 py-1.5 font-semibold",
    "border-white/10 text-white",
    "bg-[linear-gradient(135deg,var(--brand),rgba(0,0,0,0.55))]",
    "shadow-[0_8px_24px_-6px_var(--brand)]",
  ].join(" "),

  // Ink — inverted "paper": light bubble, dark text
  ink: [
    "rounded-md px-2.5 py-1",
    "border-ink bg-ink text-(--bg-root)",
    "shadow-none",
  ].join(" "),

  // Outline — ghost bubble: no fill, no shadow, just a strong border
  outline: [
    "rounded-md px-2.5 py-1",
    "border-line-strong bg-transparent text-ink-secondary",
    "shadow-none backdrop-blur-none",
  ].join(" "),

  // Terminal — mono, squared, muted — reads like a CLI hint
  terminal: [
    "rounded-[4px] px-2.5 py-1",
    "border-line bg-card",
    "font-mono text-[10px] tracking-wider text-ink-muted",
    "shadow-none",
  ].join(" "),

  // Badge — accent-tinted pill, for counts and labels that pop politely
  badge: [
    "rounded-full px-3.5 py-1",
    "border-accent/25 bg-accent/10 text-accent font-semibold",
    "shadow-none",
  ].join(" "),

  /* ── Editorial ── */

  // Solid — black capsule, white text, soft floating shadow.
  // The classic VS Code / macOS tooltip from the reference.
  solid: [
    "rounded-[10px] px-3 py-1.5",
    "border border-white/10 bg-black text-white",
    "shadow-[0_4px_12px_-2px_rgba(0,0,0,0.35),0_12px_36px_-6px_rgba(0,0,0,0.55)]",
  ].join(" "),
};

/* ── Colour tones — a semantic layer that sits ON TOP of any shape.────
   Use tone for MEANING (this board is archived, this action deletes),
   use shape for VOICE (quiet glass vs loud neon). They compose. */

export type TooltipTone =
  "neutral" | "brand" | "success" | "warning" | "danger";

const TONE_CLASS: Record<TooltipTone, string> = {
  neutral: "",
  brand: "border-(--brand)/40 bg-(--brand)/15 text-(--brand-hover)",
  success: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
  warning: "border-amber-500/40 bg-amber-500/15 text-amber-300",
  danger: "border-coral/40 bg-coral/15 text-coral",
};

/* The little rotated-square tail must match its bubble's fill,
   or every non-default shape would wear a mismatched arrow. */

const ARROW_CLASS: Record<TooltipShape, string> = {
  default: "border-line-strong bg-elevated",
  sharp: "border-line-strong bg-elevated",
  soft: "border-line-strong bg-elevated",
  pill: "border-line-strong bg-elevated",
  card: "border-line-strong bg-elevated",
  glass: "border-line bg-elevated/70",
  neon: "border-(--brand)/50 bg-(--brand)/10",
  gradient: "border-white/10 bg-(--brand)",
  ink: "border-ink bg-ink",
  outline: "border-line-strong bg-transparent",
  terminal: "border-line bg-card",
  badge: "border-accent/25 bg-accent/10",
  solid: "border-white/10 bg-black",
};

const ARROW_TONE_CLASS: Record<TooltipTone, string> = {
  neutral: "",
  brand: "border-(--brand)/40 bg-(--brand)/15",
  success: "border-emerald-500/40 bg-emerald-500/15",
  warning: "border-amber-500/40 bg-amber-500/15",
  danger: "border-coral/40 bg-coral/15",
};

/* ── Typography scale — the bubble's voice, independent of shape. ── */

export type TooltipSize = "sm" | "md" | "lg";

const SIZE_CLASS: Record<TooltipSize, string> = {
  sm: "text-[10px]",
  md: "text-[11px]",
  lg: "text-[13px]",
};

interface TooltipProps {
  /** Bubble content — string, or any node for icon + label combos. */
  label: ReactNode;
  /** Preferred side — flips automatically when there's no room. */
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
  /** Fixed bubble height — content centers vertically. */
  height?: number | string;
  /** Max bubble height — content clips gracefully. */
  maxHeight?: number | string;
  /** Text alignment when the bubble wraps (default: left) */
  align?: Align;
  /** Pre-defined bubble shape (default: 'default' — the original look) */
  shape?: TooltipShape;
  /** Semantic colour layer on top of the shape (default: 'neutral') */
  tone?: TooltipTone;
  /** Typography scale (default: 'md') */
  size?: TooltipSize;
  /** Show the arrow tail. 'none' hides it (default: 'auto') */
  caret?: "auto" | "none";
  /** px between anchor and bubble (default 8) */
  gap?: number;
  /**
   * Extra classes merged into the BUBBLE itself (not the wrapper span).
   * NOTE: the bubble is portalled to document.body, so it does NOT
   * inherit styles from `className` — use this for per-usage tweaks.
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

  /* Hover handlers only on hover-capable devices — no ghost tooltips on phones */
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
              "border border-line-strong bg-elevated/95 backdrop-blur-sm",
              "text-[11px] font-medium tracking-[0.01em] text-ink",
              align === "center" && "text-center",
              align === "right" && "text-right",
              "shadow-[0_1px_2px_rgba(0,0,0,0.10),0_6px_20px_rgba(0,0,0,0.20)]",
              /* Shape classes come AFTER the base fill/text/shadow
                 so creative variants can override all of them;
                 tone and size then layer on top of shape. */
              SHAPE_CLASS[shape],
              TONE_CLASS[tone],
              SIZE_CLASS[size],
              "transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]",
              placed ? "scale-100 opacity-100" : "scale-[0.96] opacity-0",
              bubbleClassName,
            )}
          >
            {label}
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
