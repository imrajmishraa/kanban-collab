// client/src/components/Tooltips/use-tooltip.ts
import {
  useState,
  useRef,
  useCallback,
  useLayoutEffect,
  useEffect,
} from "react";
import type { Placement, Side, Align, PlacementState } from "./types";
import { DEFAULT_GAP, MARGIN, ORIGIN } from "./constants";

export function useTooltipPosition(
  anchorRef: React.RefObject<HTMLElement | null>,
  bubbleRef: React.RefObject<HTMLElement | null>,
  placement: Placement = "bottom",
  gap = DEFAULT_GAP,
  followCursor?: boolean | "x" | "y",
) {
  const [pos, setPos] = useState<PlacementState | null>(null);
  const [placed, setPlaced] = useState(false);

  // FIXED: Renamed to pointerRef
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);

  const parsePlacement = useCallback((): { side: Side; align: Align } => {
    if (placement.includes("-")) {
      const [side, align] = placement.split("-") as [Side, Align];
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

    const bw = bubbleEl.offsetWidth;
    const bh = bubbleEl.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const { side: prefSide, align } = parsePlacement();
    const cx = anchor.left + anchor.width / 2;
    const cy = anchor.top + anchor.height / 2;

    const space: Record<Side, number> = {
      top: anchor.top,
      bottom: vh - anchor.bottom,
      left: anchor.left,
      right: vw - anchor.right,
    };

    let s: Side = prefSide;
    if (space[prefSide] < bh + gap) {
      s = (Object.keys(space) as Side[]).reduce((a, b) =>
        space[b] > space[a] ? b : a,
      );
    }

    let top;
    let left;

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

    if (align === "left") left = anchor.left;
    else if (align === "right") left = anchor.right - bw;

    left = Math.min(Math.max(left, MARGIN), Math.max(vw - bw - MARGIN, MARGIN));
    top = Math.min(Math.max(top, MARGIN), Math.max(vh - bh - MARGIN, MARGIN));

    const clamp = (v: number, size: number) =>
      Math.min(Math.max(v, 2), Math.max(size - 10, 2));

    let arrow: React.CSSProperties;
    if (s === "bottom") arrow = { top: -4, left: clamp(cx - left - 4, bw) };
    else if (s === "top")
      arrow = { bottom: -4, left: clamp(cx - left - 4, bw) };
    else if (s === "right") arrow = { left: -4, top: clamp(cy - top - 4, bh) };
    else arrow = { right: -4, top: clamp(cy - top - 4, bh) };

    setPos({
      side: s,
      align,
      style: { top, left, transformOrigin: ORIGIN[s] },
      arrow,
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
    return () => {
      window.removeEventListener("scroll", handleReposition, { capture: true });
      window.removeEventListener("resize", handleReposition);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [placed, schedulePlace]);

  return { pos, placed, place, schedulePlace, pointerRef }; // Export pointerRef
}
