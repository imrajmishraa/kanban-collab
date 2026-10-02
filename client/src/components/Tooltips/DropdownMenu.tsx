import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

type IconProp = ComponentProps<typeof HugeiconsIcon>["icon"];
type Side = "top" | "bottom" | "left" | "right";
type Align = "start" | "end";

export interface DropdownSubItem {
  label: string;
  icon?: IconProp;
  /** Right-aligned muted hint (e.g. native script for languages). */
  hint?: string;
  active?: boolean;
  onClick?: () => void;
}

export interface DropdownItem {
  label: string;
  icon?: IconProp;
  /** Right-aligned hint text on the row. */
  hint?: string;
  /** Right-aligned trailing icon (e.g. current theme's sun/moon). */
  trailing?: IconProp;
  /** Solid accent highlight — current selection. */
  active?: boolean;
  /** Coral hover treatment — destructive actions. */
  danger?: boolean;
  /** Dimmed and unclickable, but still visible for context. */
  disabled?: boolean;
  /** Secondary muted line under the label — explains what the row does. */
  description?: string;
  onClick?: () => void;
  /** Hovering the row opens a flyout submenu. */
  subItems?: DropdownSubItem[];
}

export interface DropdownDivider {
  divider: true;
}

export type DropdownEntry = DropdownItem | DropdownDivider;

/* ── Panel variants ──────────────────────────────────────────────
   'default' is the FIXED opaque look — it uses the elevated surface
   (same fill the Tooltip trusts) plus a backdrop blur, so it never
   reads see-through no matter what sits underneath. */

export type DropdownVariant = "default" | "glass" | "solid" | "outline";

const PANEL_CLASS: Record<DropdownVariant, string> = {
  // Opaque surface — the fix for the transparent panel
  default: [
    "border border-line bg-elevated/95 backdrop-blur-xl",
    "shadow-[0_4px_12px_-2px_rgba(0,0,0,0.25),0_16px_48px_-8px_rgba(0,0,0,0.45)]",
  ].join(" "),

  // Frosted glass — matches Tooltip shape="glass"
  glass: [
    "border border-line backdrop-blur-2xl",
    "bg-[linear-gradient(135deg,rgba(255,255,255,0.14),rgba(255,255,255,0.03))]",
    "shadow-[0_16px_48px_-8px_rgba(0,0,0,0.5)]",
  ].join(" "),

  // Black capsule — matches Tooltip shape="solid" (the classic look)
  solid: [
    "border border-white/10 bg-black",
    "shadow-[0_4px_12px_-2px_rgba(0,0,0,0.35),0_12px_36px_-6px_rgba(0,0,0,0.55)]",
  ].join(" "),

  // Ghost — no fill, no shadow, strong border
  outline: [
    "border border-line-strong bg-transparent backdrop-blur-none",
    "shadow-none",
  ].join(" "),
};

interface DropdownMenuProps {
  items: DropdownEntry[];
  header?: ReactNode;
  children: ReactNode;
  side?: Side;
  align?: Align;
  gap?: number;
  width?: string;
  subWidth?: string;
  closeDelay?: number;
  /** Panel style (default: 'default' — opaque) */
  variant?: DropdownVariant;
  className?: string;
}

const GAP = 8; // default panel ↔ trigger gap
const MARGIN = 8; // viewport safe area
const FLYOUT_EST = 180; // estimated flyout width for left/right flips

/* Spring-out easing — the panel pops, doesn't slide */
const EASE_OUT_EXPO = "ease-[cubic-bezier(0.22,1,0.36,1)]";

const rowBase =
  "flex w-full items-center rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-150";

export function DropdownMenu({
  items,
  header,
  children,
  side = "bottom",
  align = "start",
  gap = GAP,
  width = "w-44",
  subWidth = "w-36",
  closeDelay = 250,
  variant = "default",
  className,
}: DropdownMenuProps) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  const [open, setOpen] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [pos, setPos] = useState<{ style: CSSProperties; side: Side } | null>(
    null,
  );
  const [sub, setSub] = useState<{
    index: number;
    x: "left" | "right";
    y: "top" | "bottom";
  } | null>(null);
  /** Roving keyboard highlight — which row Enter would activate. */
  const [activeIndex, setActiveIndex] = useState(-1);

  /* Indexes of rows keyboard navigation may land on */
  const selectableIndexes = items
    .map((entry, i) => ("divider" in entry || entry.disabled ? null : i))
    .filter((i): i is number => i !== null);

  const openMenu = useCallback(() => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpen(true);
  }, []);

  const scheduleClose = useCallback(() => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      setOpen(false);
      setSub(null);
      closeTimer.current = null;
    }, closeDelay);
  }, [closeDelay]);

  const closeAll = useCallback(() => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    closeTimer.current = null;
    setOpen(false);
    setSub(null);
    setPlaced(false);
    setActiveIndex(-1);
  }, []);

  useEffect(
    () => () => {
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    },
    [],
  );

  /* Escape + click-outside close (trigger OR the portalled panel) */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAll();
    };
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      closeAll();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, closeAll]);

  /* Close on scroll / resize — the anchor moves, the panel doesn't */
  useEffect(() => {
    if (!open) return;
    window.addEventListener("scroll", closeAll, true);
    window.addEventListener("resize", closeAll);
    return () => {
      window.removeEventListener("scroll", closeAll, true);
      window.removeEventListener("resize", closeAll);
    };
  }, [open, closeAll]);

  /* Smart placement — mirror of the Tooltip: measure trigger + panel,
     prefer `side`/`align`/`gap`, flip to the roomiest side when
     clipped, clamp to the viewport. Runs before paint. */
  useLayoutEffect(() => {
    if (!open || !wrapRef.current || !panelRef.current) return;

    const a = wrapRef.current.getBoundingClientRect();
    const el = panelRef.current;
    const pw = el.offsetWidth;
    const ph = el.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const space: Record<Side, number> = {
      top: a.top,
      bottom: vh - a.bottom,
      left: a.left,
      right: vw - a.right,
    };

    let s: Side = side;
    if (space[side] < ph + gap) {
      s = (Object.keys(space) as Side[]).reduce((x, y) =>
        space[y] > space[x] ? y : x,
      );
    }

    let top: number;
    let left: number;
    if (s === "bottom") {
      top = a.bottom + gap;
      left = align === "end" ? a.right - pw : a.left;
    } else if (s === "top") {
      top = a.top - ph - gap;
      left = align === "end" ? a.right - pw : a.left;
    } else if (s === "right") {
      left = a.right + gap;
      top = align === "end" ? a.bottom - ph : a.top;
    } else {
      left = a.left - pw - gap;
      top = align === "end" ? a.bottom - ph : a.top;
    }

    /* Clamp inside the viewport */
    left = Math.min(Math.max(left, MARGIN), Math.max(vw - pw - MARGIN, MARGIN));
    top = Math.min(Math.max(top, MARGIN), Math.max(vh - ph - MARGIN, MARGIN));

    /* Scale-in grows from the edge nearest the trigger */
    const origin =
      s === "bottom"
        ? "top"
        : s === "top"
          ? "bottom"
          : s === "right"
            ? "left"
            : "right";

    setPos({ style: { top, left, transformOrigin: origin }, side: s });
    setPlaced(true);
  }, [open, side, align, gap]);

  /* ── Keyboard navigation: ↑ ↓ cycle, Home/End jump, Enter activates ──
     Lives on the wrapper so keystrokes from the focused trigger bubble
     up to it. Hover and arrows share one `activeIndex`, so mouse and
     keyboard highlight never disagree. */
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || selectableIndexes.length === 0) return;

    const current = selectableIndexes.indexOf(activeIndex);
    const move = (delta: number | "first" | "last") => {
      e.preventDefault();
      if (delta === "first") {
        setActiveIndex(selectableIndexes[0]);
      } else if (delta === "last") {
        setActiveIndex(selectableIndexes[selectableIndexes.length - 1]);
      } else {
        const next =
          (current + delta + selectableIndexes.length) %
          selectableIndexes.length;
        setActiveIndex(selectableIndexes[next]);
      }
    };

    if (e.key === "ArrowDown") move(1);
    else if (e.key === "ArrowUp") move(-1);
    else if (e.key === "Home") move("first");
    else if (e.key === "End") move("last");
    else if ((e.key === "Enter" || e.key === " ") && activeIndex >= 0) {
      const item = items[activeIndex];
      if (!("divider" in item) && !item.subItems) {
        e.preventDefault();
        closeAll();
        item.onClick?.();
      }
    }
  };

  return (
    <span
      ref={wrapRef}
      className="relative inline-flex"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
      onKeyDown={onKeyDown}
      /* Click on the trigger toggles, and never leaks to ancestors
         (e.g. the rail's click-to-open). A child trigger's own onClick
         with stopPropagation still takes precedence. */
      onClick={(e) => {
        e.stopPropagation();
        if (open) {
          closeAll();
        } else {
          openMenu();
        }
      }}
    >
      {children}

      {open &&
        createPortal(
          <div
            ref={panelRef}
            role="menu"
            onMouseEnter={openMenu}
            onMouseLeave={scheduleClose}
            onClick={(e) => e.stopPropagation()}
            style={placed && pos ? pos.style : { visibility: "hidden" }}
            className={cn(
              "fixed z-999 p-1.5 rounded-xl",
              PANEL_CLASS[variant],
              width,
              "transition-[opacity,transform] duration-150",
              EASE_OUT_EXPO,
              placed ? "opacity-100 scale-100" : "opacity-0 scale-[0.96]",
              className,
            )}
          >
            {header && (
              <>
                {header}
                <span aria-hidden className="my-1.5 block h-px bg-line" />
              </>
            )}

            {items.map((entry, i) =>
              "divider" in entry ? (
                <span
                  key={`divider-${i}`}
                  aria-hidden
                  className="my-1.5 block h-px bg-line"
                />
              ) : (
                <div
                  key={entry.label}
                  className="relative"
                  onMouseEnter={(e) => {
                    setActiveIndex(i);
                    if (!entry.subItems) {
                      setSub(null);
                      return;
                    }
                    /* Flyout flips itself: opens right when there's
                       room, left otherwise; hangs from the row's edge
                       nearest the middle of the viewport. */
                    const r = (
                      e.currentTarget as HTMLElement
                    ).getBoundingClientRect();
                    setSub({
                      index: i,
                      x:
                        window.innerWidth - r.right > FLYOUT_EST
                          ? "right"
                          : "left",
                      y: r.top > window.innerHeight / 2 ? "bottom" : "top",
                    });
                  }}
                >
                  <button
                    type="button"
                    role="menuitem"
                    aria-disabled={entry.disabled || undefined}
                    /* Rows with subItems only open the flyout on hover —
                       clicking them does nothing. */
                    onClick={() => {
                      if (entry.subItems || entry.disabled) return;
                      closeAll();
                      entry.onClick?.();
                    }}
                    className={cn(
                      rowBase,
                      entry.active
                        ? "text-accent"
                        : entry.danger
                          ? "text-ink-secondary hover:bg-coral/10 hover:text-coral"
                          : "text-ink-secondary hover:bg-hover hover:text-ink",
                      /* Roving highlight — keyboard and hover agree */
                      activeIndex === i && "bg-hover",
                      entry.disabled && "pointer-events-none opacity-40",
                    )}
                  >
                    {entry.icon && (
                      <HugeiconsIcon
                        icon={entry.icon}
                        size={14}
                        strokeWidth={2}
                        className="shrink-0"
                      />
                    )}

                    <span className="flex min-w-0 flex-1 flex-col items-start">
                      <span className="flex w-full items-center">
                        {entry.label}
                        {entry.hint && (
                          <span className="ml-auto mr-2 text-[11px] text-ink-muted">
                            {entry.hint}
                          </span>
                        )}
                        {entry.trailing && (
                          <HugeiconsIcon
                            icon={entry.trailing}
                            size={11}
                            strokeWidth={2.4}
                            className="ml-auto mr-2 text-ink-muted"
                          />
                        )}
                      </span>

                      {entry.description && (
                        <span className="text-[11px] font-normal leading-snug text-ink-muted">
                          {entry.description}
                        </span>
                      )}
                    </span>
                  </button>

                  {entry.subItems && sub?.index === i && (
                    <div
                      role="menu"
                      onMouseEnter={openMenu}
                      onMouseLeave={scheduleClose}
                      className={cn(
                        "absolute z-50 p-1.5 rounded-xl",
                        PANEL_CLASS[variant],
                        subWidth,
                        sub.x === "right"
                          ? "left-full ml-2"
                          : "right-full mr-2",
                        sub.y === "top" ? "top-0" : "bottom-0",
                      )}
                    >
                      {entry.subItems.map((s2) => (
                        <button
                          key={s2.label}
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            closeAll();
                            s2.onClick?.();
                          }}
                          className={cn(
                            rowBase,
                            "gap-2.5",
                            s2.active
                              ? "text-accent"
                              : "text-ink-secondary hover:bg-hover hover:text-ink",
                          )}
                        >
                          {s2.icon && (
                            <HugeiconsIcon
                              icon={s2.icon}
                              size={13}
                              strokeWidth={2.2}
                              className="shrink-0"
                            />
                          )}
                          {s2.label}
                          {s2.hint && (
                            <span className="text-[11px] text-ink-muted">
                              {s2.hint}
                            </span>
                          )}
                          {s2.active && (
                            <HugeiconsIcon
                              icon={CheckmarkCircle02Icon}
                              size={12}
                              strokeWidth={2.4}
                              className="ml-auto text-accent"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ),
            )}
          </div>,
          document.body,
        )}
    </span>
  );
}
