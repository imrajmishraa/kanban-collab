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
import { EXIT_MS } from "./constants";
import { useTooltipGroup } from "./useTooltipGroup";
import {
  claimTooltip,
  onClosedByOther,
  onSuppressionChange,
  releaseTooltip,
  tooltipsSuppressed,
  watchDrags,
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
    labelledBy = false,
    asChild = false,
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

  /* One token per tooltip: the bus uses it to close this bubble when another one opens. */
  const tokenRef = useRef<symbol>(Symbol("tooltip"));

  /* Leaving takes a moment: the bubble stays mounted while it fades, then goes. */
  const [closing, setClosing] = useState(false);
  const exitTimer = useRef<number | null>(null);

  const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  useEffect(() => watchDrags(), []);

  const setOpen = useCallback(
    (value: boolean) => {
      if (!isControlled) setInternalOpen(value);
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange],
  );

  const id = useId();
  const { pos, placed, place, schedulePlace, pointerRef } = useTooltipPosition(
    wrapRef,
    bubbleRef,
    /* `side` is the old prop; `placement` is the upgrade. */
    placement ?? side ?? "bottom",
    gap,
    followCursor,
    offset,
  );

  const clearPending = useCallback(() => {
    if (showTimer.current !== null) window.clearTimeout(showTimer.current);
    if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
    if (touchTimer.current !== null) window.clearTimeout(touchTimer.current);
    showTimer.current = null;
    hideTimer.current = null;
    touchTimer.current = null;
  }, []);

  /*
   * `truncationOnly` answers a narrower question than hover: is this text actually cut off?
   * If it is not, the tooltip would only repeat what the reader can already see.
   */
  const isTruncated = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return true;
    const target =
      el.firstElementChild instanceof HTMLElement ? el.firstElementChild : el;
    return target.scrollWidth > target.clientWidth + 1;
  }, []);

  const show = useCallback(() => {
    if (disabled) return;
    /* Nothing opens while a drag or an open menu owns the pointer. */
    if (tooltipsSuppressed()) return;
    if (truncationOnly && !isTruncated()) return;
    if (hideTimer.current !== null) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    if (showTimer.current !== null || open) return;

    // Skip delay if another tooltip was recently closed in the group
    const isRecentlyClosed = group
      ? Date.now() - (group.lastClosedAtRef.current ?? 0) < 300
      : false;
    const actualDelay = isRecentlyClosed ? 0 : delay;

    showTimer.current = window.setTimeout(() => {
      showTimer.current = null;
      claimTooltip(tokenRef.current);
      if (exitTimer.current !== null) {
        window.clearTimeout(exitTimer.current);
        exitTimer.current = null;
      }
      setClosing(false);
      setOpen(true);
    }, actualDelay);
  }, [delay, disabled, open, setOpen, group, truncationOnly, isTruncated]);

  /* Every close goes through here, so nothing vanishes abruptly. */
  const beginExit = useCallback(() => {
    clearPending();
    releaseTooltip(tokenRef.current);

    /* A reduced-motion reader gets the old behaviour: gone at once. */
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
  }, [clearPending, setOpen]);

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

  /* Another tooltip opened: this one steps aside, and so does an open one when a drag
     starts. Both arrive through the bus. */
  useEffect(() => {
    const offClosed = onClosedByOther(tokenRef.current, beginExit);
    const offSuppressed = onSuppressionChange(() => {
      if (tooltipsSuppressed()) beginExit();
    });
    return () => {
      offClosed();
      offSuppressed();
    };
  }, [beginExit]);

  useEffect(() => clearPending, [clearPending]);

  /* `autoHide` closes the bubble on its own — "Copied!", "Saved", a status flash. */
  useEffect(() => {
    if (!open || !autoHide) return;

    const timer = window.setTimeout(() => setOpen(false), autoHide);
    return () => window.clearTimeout(timer);
  }, [open, autoHide, setOpen]);

  useEffect(() => {
    if (open) place();
    else {
      // Mark closed in group context so next tooltip opens instantly
      if (group) group.markClosed();
    }
  }, [open, place, group]);

  /* `ref.open()` / `ref.close()` — for the cases a pointer cannot express: a tour step, a
     validation message, a "copied" flash triggered by code. */
  useImperativeHandle(
    ref,
    () => ({
      open: () => show(),
      close: () => hideNow(),
      toggle: () => (open ? hideNow() : show()),
    }),
    [show, hideNow, open],
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
      /* Icon-only buttons: the tooltip *is* the label, so it must be the accessible name
         rather than a description nobody reads out with the button. */
      return cloneElement(child, { "aria-labelledby": id });
    }

    const existing = child.props["aria-describedby"];
    return cloneElement(child, {
      "aria-describedby": existing ? `${existing} ${id}` : id,
    });
  })();

  /*
   * What opens the bubble. `hover` is the default and the old behaviour; `focus` is for
   * keyboard-only hints, `click` pins it, and `manual` leaves it entirely to `open`.
   */
  const opensOnHover = triggerMode === "hover" && canHover;
  const opensOnClick = triggerMode === "click";

  const hoverProps = opensOnHover
    ? { onMouseEnter: show, onMouseLeave: hide }
    : {};

  const clickProps = opensOnClick
    ? {
        onClick: () => (open ? hideNow() : show()),
        /* A click-tooltip should not also appear on hover, or the click reads as a
           no-op because it was already open. */
        onMouseEnter: undefined,
      }
    : {};

  /*
   * `asChild` puts these handlers on the child itself instead of on a wrapper span: an
   * extra span around a button is an extra box in the layout, and inside a flex row it
   * changes the spacing of everything beside it.
   */
  const triggerProps = {
    ...hoverProps,
    ...clickProps,
    onMouseMove: (e: React.MouseEvent) => {
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
      if (e.key === "Escape") hideNow();
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
      /* A long press has already opened the bubble by the time the finger lifts; a quick
         tap is the other half of the toggle. */
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

      {(open || closing) &&
        !disabled &&
        createPortal(
          /*
           * The bubble is the portal child, as it was before the refactor. An extra
           * wrapper span is not harmless: `bubbleRef` then measures the wrapper — a
           * static, zero-size inline box at the end of `body` — so the flip and clamp
           * maths work from the wrong rect and the bubble lands in the wrong place.
           */
          <TooltipContent
            ref={bubbleRef}
            interactive={interactive}
            id={id}
            label={label}
            description={description}
            shortcut={shortcut}
            highlight={highlight}
            shape={shape}
            tone={tone}
            theme={theme}
            size={size}
            align={align}
            caret={caret}
            maxLines={maxLines}
            bubbleClassName={bubbleClassName}
            pos={pos}
            placed={placed}
            style={pos?.style ?? {}}
            followCursor={!!followCursor}
            /* WCAG 1.4.13: content the pointer can reach must stay while it travels
               there. Without this the bubble vanishes on the way and the text inside it
               can never be selected. */
            onBubbleEnter={interactive ? show : undefined}
            onBubbleLeave={interactive ? hide : undefined}
            closing={closing}
          />,
          document.body,
        )}
    </span>
  );
});
