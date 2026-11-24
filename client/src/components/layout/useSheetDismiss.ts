import { useEffect, useRef } from "react";

/**
 * Closing a full-screen sheet, three ways.
 *
 * ✕ in its header is the visible one; a swipe to the right is the one a thumb reaches for;
 * `Esc` is the one a keyboard has. None of them is a drag handle — there is no width to
 * resize on a phone, so the sheet carries no divider at all.
 *
 * A quarter of the screen, or a flick, puts it away: less than that is a scroll that drifted.
 */
export function useSheetDismiss({
  sheet,
  onClose,
}: {
  sheet: boolean;
  onClose: () => void;
}) {
  const swipe = useRef<{ x: number; moved: boolean } | null>(null);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sheet) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet, onClose]);

  if (!sheet) return { ref };

  return {
    ref,
    onPointerDown: (event: React.PointerEvent) => {
      if (event.button !== 0 || !event.isPrimary) return;
      swipe.current = { x: event.clientX, moved: false };
    },
    onPointerMove: (event: React.PointerEvent) => {
      if (!swipe.current || !ref.current) return;

      /* A drag needs a held button; a lost pointerup must not leave a swipe that follows
         the pointer. */
      if (event.buttons === 0) {
        swipe.current = null;
        return;
      }

      const dx = event.clientX - swipe.current.x;
      if (Math.abs(dx) > 6) swipe.current.moved = true;

      if (dx > 0) {
        ref.current.style.transition = "none";
        ref.current.style.transform = `translateX(${Math.min(dx, window.innerWidth * 0.5)}px)`;
      }
    },
    onPointerUp: (event: React.PointerEvent) => {
      if (!swipe.current) return;

      const dx = event.clientX - swipe.current.x;
      const wasMoving = swipe.current.moved;
      swipe.current = null;

      if (ref.current) {
        ref.current.style.transform = "";
        ref.current.style.transition = "";
      }

      if (wasMoving && dx > Math.min(120, window.innerWidth * 0.25)) onClose();
    },
    onPointerCancel: () => {
      swipe.current = null;
    },
  };
}
