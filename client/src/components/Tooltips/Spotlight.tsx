import { useLayoutEffect, useState, type RefObject } from "react";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * The dim behind an onboarding step.
 *
 * One fixed layer with a hole: the anchor keeps its light and everything else is pushed back.
 * `box-shadow` on a transparent box is the trick — an outline that only exists outside the
 * anchor, so nothing has to be masked.
 *
 * The rect is measured after paint, not during render: a ref read in render is a value React
 * has no reason to re-render for.
 */
export function Spotlight({
  anchorRef,
  dim = 0.55,
}: {
  anchorRef: RefObject<HTMLElement | null>;
  dim?: number;
}) {
  const [rect, setRect] = useState<Rect | null>(null);

  useLayoutEffect(() => {
    const el = anchorRef.current;
    if (!el) return;

    const measure = () => {
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };

    measure();
    window.addEventListener("scroll", measure, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", measure);

    return () => {
      window.removeEventListener("scroll", measure, { capture: true });
      window.removeEventListener("resize", measure);
    };
  }, [anchorRef]);

  if (!rect) return null;

  const pad = 6;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-999"
      style={{ background: `rgba(0,0,0,${dim})` }}
    >
      <div
        className="absolute rounded-lg ring-2 ring-(--accent)"
        style={{
          top: rect.top - pad,
          left: rect.left - pad,
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
          boxShadow: `0 0 0 9999px rgba(0,0,0,${dim})`,
          background: "transparent",
        }}
      />
    </div>
  );
}
