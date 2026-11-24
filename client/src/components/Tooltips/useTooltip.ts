// client/src/components/Tooltips/use-tooltip.ts
import {
  useState,
  useRef,
  useCallback,
  useLayoutEffect,
  useEffect,
} from "react";
import type { Placement, Side, Align, PlacementState } from "./types";
import { DEFAULT_GAP, ORIGIN } from "./constants";
import { computePlacement } from "@/lib/tooltipPosition";

export function useTooltipPosition(
  anchorRef: React.RefObject<HTMLElement | null>,
  bubbleRef: React.RefObject<HTMLElement | null>,
  placement: Placement = "bottom",
  gap = DEFAULT_GAP,
  followCursor?: boolean | "x" | "y",
  offset: { x?: number; y?: number } = {},
) {
  /* `offset` is an object literal at every call site, so depending on it directly would
     rebuild `place` on every render. The values are what matter. */
  const offsetRef = useRef(offset);
  useEffect(() => {
    offsetRef.current = offset;
  });
  const [pos, setPos] = useState<PlacementState | null>(null);
  const [placed, setPlaced] = useState(false);

  // FIXED: Renamed to pointerRef
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);

  const parsePlacement = useCallback((): { side: Side; align: Align } => {
    if (placement.includes("-")) {
      const [side, raw] = placement.split("-") as [Side, Align];
      /* `start` / `end` are the RTL-safe spelling of left / right. */
      const align: Align =
        raw === "start" ? "left" : raw === "end" ? "right" : raw;
      return { side, align };
    }
    return { side: placement as Side, align: "center" };
  }, [placement]);

  const place = useCallback(() => {
    const anchorEl = anchorRef.current;
    const bubbleEl = bubbleRef.current;
    if (!anchorEl || !bubbleEl) return;

    const el0 = anchorEl.getBoundingClientRect();
    let anchor = {
      left: el0.left,
      right: el0.right,
      top: el0.top,
      bottom: el0.bottom,
      width: el0.width,
      height: el0.height,
    };

    if (followCursor && pointerRef.current) {
      const { x, y } = pointerRef.current;
      const fx = followCursor !== "y";
      const fy = followCursor !== "x";
      anchor = {
        left: fx ? x : el0.left,
        right: fx ? x : el0.right,
        top: fy ? y : el0.top,
        bottom: fy ? y : el0.bottom,
        width: fx ? 0 : el0.width,
        height: fy ? 0 : el0.height,
      };
    }

    const { side, align } = parsePlacement();

    const placement = computePlacement({
      anchor,
      bubble: { width: bubbleEl.offsetWidth, height: bubbleEl.offsetHeight },
      viewport: { width: window.innerWidth, height: window.innerHeight },
      side,
      align,
      gap,
      offset: offsetRef.current,
    });

    setPos({
      side: placement.side,
      align,
      style: {
        top: placement.top,
        left: placement.left,
        transformOrigin: ORIGIN[placement.side],
      },
      arrow: placement.arrow as React.CSSProperties,
    });

    setPlaced(true);
  }, [anchorRef, bubbleRef, gap, followCursor, parsePlacement]);

  const schedulePlace = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      place();
    });
  }, [place]);

  useLayoutEffect(() => {
    if (placed) place();
  }, [placed, place]);

  useEffect(() => {
    if (!placed) return;
    const handleReposition = () => schedulePlace();
    window.addEventListener("scroll", handleReposition, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", handleReposition);

    /* A `resize` on the window is not the only thing that moves an anchor: the sidebar
       collapsing, a label growing, a card reflowing. Watch the anchor itself. */
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => schedulePlace());

    const anchorEl = anchorRef.current;
    if (observer && anchorEl) observer.observe(anchorEl);

    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", handleReposition, { capture: true });
      window.removeEventListener("resize", handleReposition);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    /* `anchorRef` is a ref: its identity never changes, so it does not belong here. */
  }, [placed, schedulePlace, anchorRef]);

  return { pos, placed, place, schedulePlace, pointerRef }; // Export pointerRef
}
