import { useLayoutEffect, useState, type RefObject } from "react";

/**
 * The line between two steps of a tour.
 *
 * "Stacking" in the list was two bubbles pointing at each other; what it actually buys is a
 * reader seeing *where the next step is*. One SVG line between two anchors does that without
 * a second bubble.
 */
export function TooltipConnector({
  from,
  to,
}: {
  from: RefObject<HTMLElement | null>;
  to: RefObject<HTMLElement | null>;
}) {
  const [line, setLine] = useState<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const a = from.current?.getBoundingClientRect();
      const b = to.current?.getBoundingClientRect();
      if (!a || !b) return;

      setLine({
        x1: a.left + a.width / 2,
        y1: a.top + a.height / 2,
        x2: b.left + b.width / 2,
        y2: b.top + b.height / 2,
      });
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
  }, [from, to]);

  if (!line) return null;

  return (
    <svg
      aria-hidden
      className="pointer-events-none fixed inset-0 z-999 size-full"
    >
      <line
        x1={line.x1}
        y1={line.y1}
        x2={line.x2}
        y2={line.y2}
        stroke="var(--accent)"
        strokeWidth={2}
        strokeDasharray="4 4"
      />
    </svg>
  );
}
