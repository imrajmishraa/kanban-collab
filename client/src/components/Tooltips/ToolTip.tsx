import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useId,
  cloneElement,
  isValidElement,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils/cn";
import type { TooltipProps } from "./types";
import { useTooltipPosition } from "./useTooltip";
import { TooltipContent } from "./TooltipContent";
import { useTooltipGroup } from "./useTooltipGroup";

const canHover =
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export function Tooltip({
  label,
  description,
  shortcut,
  children,
  className,
  delay = 180,
  hideDelay = 80,
  disabled = false,
  placement = "bottom",
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
  open: controlledOpen,
  onOpenChange,
}: TooltipProps) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const showTimer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);
  const touchTimer = useRef<number | null>(null);

  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const group = useTooltipGroup(); // Group context for delay skipping

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
    placement,
    gap,
    followCursor,
  );

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

    // Skip delay if another tooltip was recently closed in the group
    const isRecentlyClosed = group
      ? Date.now() - (group.lastClosedAtRef.current ?? 0) < 300
      : false;
    const actualDelay = isRecentlyClosed ? 0 : delay;

    showTimer.current = window.setTimeout(() => {
      showTimer.current = null;
      setOpen(true);
    }, actualDelay);
  }, [delay, disabled, open, setOpen, group]);

  const hide = useCallback(() => {
    if (showTimer.current !== null) {
      window.clearTimeout(showTimer.current);
      showTimer.current = null;
    }
    if (hideTimer.current !== null) return;
    hideTimer.current = window.setTimeout(() => {
      hideTimer.current = null;
      setOpen(false);
    }, hideDelay);
  }, [hideDelay, setOpen]);

  const hideNow = useCallback(() => {
    clearPending();
    setOpen(false);
  }, [clearPending, setOpen]);

  useEffect(() => clearPending, [clearPending]);

  useEffect(() => {
    if (open) place();
    else {
      // Mark closed in group context so next tooltip opens instantly
      if (group) group.markClosed();
    }
  }, [open, place, group]);

  const trigger = (() => {
    if (disabled || !isValidElement(children)) return children;
    const child = children as React.ReactElement<{
      "aria-describedby"?: string;
    }>;
    const existing = child.props["aria-describedby"];
    return cloneElement(child, {
      "aria-describedby": existing ? `${existing} ${id}` : id,
    });
  })();

  const hoverProps = canHover ? { onMouseEnter: show, onMouseLeave: hide } : {};

  return (
    <span
      ref={wrapRef}
      className={cn("relative inline-flex", className)}
      {...hoverProps}
      onMouseMove={(e) => {
        if (!followCursor) return;
        if (pointerRef) {
          pointerRef.current = { x: e.clientX, y: e.clientY }; // FIXED: Used pointerRef
        }
        if (open) schedulePlace();
      }}
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
      onTouchStart={() => {
        if (disabled || touchTimer.current !== null) return;
        touchTimer.current = window.setTimeout(() => {
          touchTimer.current = null;
          setOpen(true);
        }, 500);
      }}
      onTouchMove={() => {
        clearPending();
        hideNow();
      }}
      onTouchEnd={() => {
        clearPending();
        hideNow();
      }}
      onTouchCancel={() => {
        clearPending();
        hideNow();
      }}
    >
      {trigger}

      {open &&
        !disabled &&
        createPortal(
          <span
            ref={bubbleRef}
            className={
              interactive ? "pointer-events-auto" : "pointer-events-none"
            }
          >
            <TooltipContent
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
              bubbleClassName={bubbleClassName}
              pos={pos}
              placed={placed}
              style={pos?.style ?? {}}
              followCursor={!!followCursor}
            />
          </span>,
          document.body,
        )}
    </span>
  );
}
