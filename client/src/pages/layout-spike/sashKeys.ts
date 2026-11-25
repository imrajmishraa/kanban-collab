import type { AllotmentHandle } from "allotment";

import { KEY_STEP } from "@/lib/layoutRules";

interface Bound {
  min: number;
  max: number;
}

interface Options {
  /** The element `Allotment` rendered into. */
  root: HTMLElement | null;
  handle: AllotmentHandle | null;
  sizes: number[];
  /** One entry per pane, in the same order as `sizes`. */
  bounds: Bound[];
  onResize: (next: number[]) => void;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/**
 * E3: a sash has to work without a pointer.
 *
 * `allotment` draws its sashes as plain `div`s: no tab stop, no role, no key
 * handling. That is fine for a mouse and unusable for everyone else — and the
 * app's own dividers have been keyboard-operable since the rail work. This adds
 * the missing half: focus, a role, and arrows that move the boundary between two
 * panes by 8px (32 with Shift), with Home/End jumping to the left pane's bounds.
 *
 * It re-attaches on every render because the listeners close over `sizes`, and a
 * listener holding last render's widths would apply its delta to the wrong pair.
 */
export function attachSashKeys({
  root,
  handle,
  sizes,
  bounds,
  onResize,
}: Options): () => void {
  if (!root) return () => undefined;

  const sashes = Array.from(root.querySelectorAll<HTMLElement>(".sash"));

  const cleanups = sashes.map((sash, index) => {
    const left = index;
    const right = index + 1;
    const leftBound = bounds[left] ?? { min: 0, max: Number.MAX_SAFE_INTEGER };
    const rightBound = bounds[right] ?? {
      min: 0,
      max: Number.MAX_SAFE_INTEGER,
    };

    sash.tabIndex = 0;
    sash.setAttribute("role", "separator");
    sash.setAttribute("aria-orientation", "vertical");
    sash.setAttribute("aria-label", `Resize pane ${left + 1}`);
    sash.setAttribute("aria-valuenow", String(Math.round(sizes[left] ?? 0)));
    sash.setAttribute("aria-valuemin", String(leftBound.min));
    sash.setAttribute("aria-valuemax", String(leftBound.max));

    const apply = (rawTarget: number) => {
      const target = clamp(rawTarget, leftBound.min, leftBound.max);
      const delta = target - (sizes[left] ?? 0);
      const nextRight = (sizes[right] ?? 0) - delta;

      /* The right pane's floor is a wall, not a suggestion: a move that would
         push it under is refused rather than clamped, so the boundary stops
         instead of drifting. */
      if (nextRight < rightBound.min) return;

      const next = [...sizes];
      next[left] = target;
      next[right] = nextRight;

      handle?.resize(next);
      onResize(next);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const step = event.shiftKey ? KEY_STEP.shift : KEY_STEP.base;
      const current = sizes[left] ?? 0;

      const target =
        event.key === "ArrowRight"
          ? current + step
          : event.key === "ArrowLeft"
            ? current - step
            : event.key === "Home"
              ? leftBound.min
              : event.key === "End"
                ? leftBound.max
                : null;

      if (target === null) return;

      event.preventDefault();
      apply(target);
    };

    sash.addEventListener("keydown", onKeyDown);

    return () => sash.removeEventListener("keydown", onKeyDown);
  });

  return () => cleanups.forEach((cleanup) => cleanup());
}
