import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useId,
  cloneElement,
  forwardRef,
  isValidElement,
  useImperativeHandle,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils/cn";
import type { TooltipProps } from "./types";
import { useTooltipPosition } from "./useTooltip";
import { TooltipContent } from "./TooltipContent";
import { EXIT_MS, SHAPE_GAP } from "./constants";
import { Spotlight } from "./Spotlight";
import { emitTooltipEvent } from "@/lib/tooltipAnalytics";
import { shortcutKeys } from "@/lib/shortcutKeys";
import { resolveTriggers } from "@/lib/tooltipTriggers";
import { useTooltipGroup } from "./useTooltipGroup";
import {
  claimTooltip,
  onClosedByOther,
  onScrollHide,
  onSuppressionChange,
  releaseTooltip,
  tooltipsSuppressed,
  watchDrags,
  watchScrolls,
} from "@/lib/tooltipBus";

const canHover =
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export interface TooltipHandle {
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const Tooltip = forwardRef<TooltipHandle, TooltipProps>(function Tooltip(
  {
    label,
    description,
    shortcut,
    children,
    className,
    delay = 180,
    hideDelay = 80,
    disabled = false,
    placement,
    side,
    align = "left",
    shape = "default",
    tone = "neutral",
    theme = "auto",
    size = "md",
    caret = "auto",
    highlight,
    gap = 8,
    bubbleClassName,
    followCursor = false,
    interactive = false,
    offset = {},
    truncationOnly = false,
    autoHide,
    maxLines,
    trigger: triggerMode = "hover",
    descriptionTone,
    labelledBy = false,
    asChild = false,
    icon,
    loading,
    avatar,
    highlightAnchor = false,
    copyValue,
    actions,
    fallbackSides,
    boundaryRef,
    virtualAnchor,
    loadContent,
    topLayer = false,
    trackId,
    morph = false,
    magnetic = false,
    spotlight = false,
    open: controlledOpen,
    onOpenChange,
  }: TooltipProps,
  ref,
) {
  const wrapRef = useRef<HTMLElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const showTimer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);
  const touchTimer = useRef<number | null>(null);

  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const group = useTooltipGroup(); // Group context for delay skipping

  const tokenRef = useRef<symbol>(Symbol("tooltip"));

  const openedAt = useRef<number | null>(null);

  const [closing, setClosing] = useState(false);
  const [pinned, setPinned] = useState(false);

  const [magnet, setMagnet] = useState({ x: 0, y: 0 });
  const exitTimer = useRef<number | null>(null);

  const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  useEffect(() => {
    watchDrags();
    watchScrolls();
  }, []);

  const id = useId();
  const { pos, placed, place, schedulePlace, pointerRef } = useTooltipPosition(
    wrapRef,
    bubbleRef,
    placement ?? side ?? "bottom",
    SHAPE_GAP[shape] ?? gap,
    followCursor,
    offset,
    {
      fallbackSides,
      boundaryRef,
      virtualAnchor,
    },
  );

  const [loaded, setLoaded] = useState<React.ReactNode>(null);

  useEffect(() => {
    if (!open || !loadContent) return;

    let alive = true;
    setLoaded(null);

    void loadContent().then((content) => {
      if (alive) setLoaded(content);
    });

    return () => {
      alive = false;
    };
  }, [open, loadContent]);

  const clearPending = useCallback(() => {
    if (showTimer.current !== null) window.clearTimeout(showTimer.current);
    if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
    if (touchTimer.current !== null) window.clearTimeout(touchTimer.current);
    showTimer.current = null;
    hideTimer.current = null;
    touchTimer.current = null;
  }, []);

  const isTruncated = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return true;
    const target =
      el.firstElementChild instanceof HTMLElement ? el.firstElementChild : el;
    return target.scrollWidth > target.clientWidth + 1;
  }, []);

  const setOpen = useCallback(
    (value: boolean) => {
      if (!isControlled) setInternalOpen(value);
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange],
  );

  const showNow = useCallback(() => {
    if (disabled) return;
    if (tooltipsSuppressed()) return;
    if (truncationOnly && !isTruncated()) return;

    if (showTimer.current !== null) {
      window.clearTimeout(showTimer.current);
      showTimer.current = null;
    }
    if (hideTimer.current !== null) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    if (exitTimer.current !== null) {
      window.clearTimeout(exitTimer.current);
      exitTimer.current = null;
    }

    claimTooltip(tokenRef.current);

    if (trackId) {
      openedAt.current = Date.now();
      emitTooltipEvent({ id: trackId, kind: "show" });
    }

    setClosing(false);
    setOpen(true);
  }, [disabled, truncationOnly, isTruncated, trackId, setOpen]);

  const show = useCallback(() => {
    if (disabled) return;
    if (tooltipsSuppressed()) return;
    if (truncationOnly && !isTruncated()) return;
    if (hideTimer.current !== null) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    if (showTimer.current !== null || open) return;

    const isRecentlyClosed = group
      ? Date.now() - (group.lastClosedAtRef.current ?? 0) < 300
      : false;
    const actualDelay = isRecentlyClosed ? 0 : delay;

    showTimer.current = window.setTimeout(() => {
      showTimer.current = null;
      claimTooltip(tokenRef.current);

      if (trackId) {
        openedAt.current = Date.now();
        emitTooltipEvent({ id: trackId, kind: "show" });
      }

      if (exitTimer.current !== null) {
        window.clearTimeout(exitTimer.current);
        exitTimer.current = null;
      }
      setClosing(false);
      setOpen(true);
    }, actualDelay);
  }, [
    delay,
    disabled,
    open,
    setOpen,
    group,
    truncationOnly,
    isTruncated,
    trackId,
  ]);

  const beginExit = useCallback(() => {
    setPinned(false);
    if (openedAt.current !== null) {
      emitTooltipEvent({
        id: trackId ?? "tooltip",
        kind: "hide",
        ms: Date.now() - openedAt.current,
      });
      openedAt.current = null;
    }

    clearPending();
    releaseTooltip(tokenRef.current);

    if (prefersReducedMotion()) {
      setOpen(false);
      return;
    }

    setClosing(true);
    if (exitTimer.current !== null) window.clearTimeout(exitTimer.current);
    exitTimer.current = window.setTimeout(() => {
      exitTimer.current = null;
      setClosing(false);
      setOpen(false);
    }, EXIT_MS);
  }, [clearPending, setOpen, trackId]);

  const hideNow = beginExit;

  const hide = useCallback(() => {
    if (showTimer.current !== null) {
      window.clearTimeout(showTimer.current);
      showTimer.current = null;
    }
    if (hideTimer.current !== null) return;
    hideTimer.current = window.setTimeout(() => {
      hideTimer.current = null;
      beginExit();
    }, hideDelay);
  }, [hideDelay, beginExit]);

  useEffect(
    () => () => {
      if (exitTimer.current !== null) window.clearTimeout(exitTimer.current);
    },
    [],
  );

  useEffect(() => {
    const offClosed = onClosedByOther(tokenRef.current, beginExit);
    const offScroll = onScrollHide(beginExit);
    const offSuppressed = onSuppressionChange(() => {
      if (tooltipsSuppressed()) beginExit();
    });
    return () => {
      offClosed();
      offScroll();
      offSuppressed();
    };
  }, [beginExit]);

  useEffect(() => clearPending, [clearPending]);

  useEffect(() => {
    if (!open || !autoHide) return;

    const timer = window.setTimeout(() => setOpen(false), autoHide);
    return () => window.clearTimeout(timer);
  }, [open, autoHide, setOpen]);

  useEffect(() => {
    if (open) place();
    else {
      if (group) group.markClosed();
    }
  }, [open, place, group]);

  useImperativeHandle(
    ref,
    () => ({
      open: () => showNow(),
      close: () => hideNow(),
      toggle: () => (open ? hideNow() : showNow()),
    }),
    [showNow, hideNow, open],
  );

  const interactiveBubble =
    interactive || Boolean(actions) || Boolean(copyValue);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry && !entry.isIntersecting) beginExit();
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [beginExit]);

  useEffect(() => {
    if (!open || !interactiveBubble) return;

    const inside = (el: HTMLElement | null, x: number, y: number, pad = 8) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return (
        x >= r.left - pad &&
        x <= r.right + pad &&
        y >= r.top - pad &&
        y <= r.bottom + pad
      );
    };

    const between = (x: number, y: number) => {
      const a = wrapRef.current?.getBoundingClientRect();
      const b = bubbleRef.current?.getBoundingClientRect();
      if (!a || !b) return false;

      const left = Math.min(a.left, b.left) - 8;
      const right = Math.max(a.right, b.right) + 8;
      const top = Math.min(a.top, b.top) - 8;
      const bottom = Math.max(a.bottom, b.bottom) + 8;

      return x >= left && x <= right && y >= top && y <= bottom;
    };

    const onMove = (event: PointerEvent) => {
      const { clientX: x, clientY: y } = event;

      if (
        inside(wrapRef.current, x, y) ||
        inside(bubbleRef.current, x, y) ||
        between(x, y)
      ) {
        if (hideTimer.current !== null) {
          window.clearTimeout(hideTimer.current);
          hideTimer.current = null;
        }
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [open, interactiveBubble]);

  const skeleton = (
    <span className="flex w-32 flex-col gap-1">
      <span className="h-2 w-full animate-pulse rounded bg-current/20" />
      <span className="h-2 w-2/3 animate-pulse rounded bg-current/20" />
    </span>
  );

  const trigger = (() => {
    if (disabled || !isValidElement(children)) return children;
    const child = children as React.ReactElement<{
      "aria-describedby"?: string;
      "aria-labelledby"?: string;
    }>;
    if (import.meta.env.DEV) {
      const props = child.props as { disabled?: boolean };
      if (props.disabled) {
        console.warn(
          "[Tooltip] The trigger is a disabled element: a disabled button receives no pointer events, so the bubble can only be opened from code.",
        );
      }
    }

    if (labelledBy) {
      return cloneElement(child, { "aria-labelledby": id });
    }

    const existing = child.props["aria-describedby"];
    return cloneElement(child, {
      "aria-describedby": existing ? `${existing} ${id}` : id,
    });
  })();

  const triggers = resolveTriggers(triggerMode, canHover);
  const opensOnHover = triggers.hover;
  const opensOnClick = triggers.click;

  const hoverProps = opensOnHover
    ? {
        onMouseEnter: show,
        onMouseLeave: () => {
          if (!pinned) hide();
        },
      }
    : {};

  const clickProps = opensOnClick
    ? {
        onClick: () => {
          if (pinned) {
            setPinned(false);
            hideNow();
            return;
          }

          setPinned(true);
          showNow();
        },
      }
    : {};

  const triggerProps = {
    "data-tooltip-open": highlightAnchor && open ? "true" : undefined,
    ...(highlightAnchor && open
      ? { className: "rounded-lg ring-2 ring-(--accent-soft)" }
      : {}),
    ...hoverProps,
    ...clickProps,
    onMouseMove: (e: React.MouseEvent) => {
      if (magnetic) {
        /* A few pixels towards the pointer: enough to feel alive, not enough to drift. */
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        setMagnet({
          x: Math.max(-6, Math.min(6, dx * 0.15)),
          y: Math.max(-6, Math.min(6, dy * 0.15)),
        });
      }
      if (!followCursor) return;
      if (pointerRef) pointerRef.current = { x: e.clientX, y: e.clientY };
      if (open) schedulePlace();
    },
    onFocus: (e: React.FocusEvent) => {
      if (
        e.target instanceof HTMLElement &&
        e.target.matches(":focus-visible")
      ) {
        show();
      }
    },
    onBlur: hide,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setPinned(false);
        hideNow();
      }
    },
    onTouchStart: () => {
      if (disabled || touchTimer.current !== null) return;
      touchTimer.current = window.setTimeout(() => {
        touchTimer.current = null;
        setOpen(true);
      }, 500);
    },
    onTouchMove: () => {
      clearPending();
      hideNow();
    },
    onTouchEnd: () => {
      if (touchTimer.current !== null) {
        window.clearTimeout(touchTimer.current);
        touchTimer.current = null;
      }
      hideNow();
    },
    onTouchCancel: () => {
      clearPending();
      hideNow();
    },
  };

  if (asChild && isValidElement(children)) {
    const child = children as React.ReactElement<{ className?: string }>;
    return cloneElement(child, {
      ref: wrapRef,
      ...triggerProps,
      className: cn("relative inline-flex", child.props.className, className),
    } as never);
  }

  return (
    <span
      ref={wrapRef}
      className={cn("relative inline-flex", className)}
      {...triggerProps}
    >
      {trigger}

      {spotlight && open && !disabled && wrapRef.current
        ? createPortal(<Spotlight anchorRef={wrapRef} />, document.body)
        : null}

      {(open || closing) &&
        !disabled &&
        createPortal(
          <TooltipContent
            ref={bubbleRef}
            interactive={interactiveBubble}
            id={id}
            label={loaded ?? (loadContent && !loaded ? skeleton : label)}
            description={description}
            shortcut={shortcut ? shortcutKeys(shortcut) : undefined}
            highlight={highlight}
            shape={shape}
            tone={tone}
            theme={theme}
            size={size}
            align={align}
            caret={caret}
            maxLines={maxLines}
            descriptionTone={descriptionTone}
            icon={icon}
            loading={loading}
            avatar={avatar}
            copyValue={copyValue}
            actions={actions}
            bubbleClassName={bubbleClassName}
            pos={pos}
            placed={placed}
            style={pos?.style ?? {}}
            followCursor={!!followCursor}
            onBubbleEnter={interactive ? show : undefined}
            onBubbleLeave={interactive ? hide : undefined}
            closing={closing}
            topLayer={topLayer}
            morph={morph}
            magnet={magnetic ? magnet : undefined}
          />,
          document.body,
        )}
    </span>
  );
});
