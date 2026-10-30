/**
 * The theme change, revealed rather than swapped.
 *
 * The browser snapshots the page before and after the class flips, and the
 * incoming snapshot is clipped to a circle that opens on the bottom edge of the
 * window, under the control that was pressed, and grows until it covers the
 * viewport. So the change reads as light spilling out of the toggle instead of
 * the whole page blinking.
 *
 * Everything here degrades to an instant switch: no View Transitions support,
 * reduced motion, or a snapshot that never becomes ready all just apply the
 * theme with no animation.
 */

/** The part of the View Transitions API we use, declared locally so this file
 *  does not depend on the DOM lib shipping the types. */
interface ViewTransitionLike {
  ready: Promise<void>;
  finished: Promise<void>;
}

type StartViewTransition = (callback: () => void) => ViewTransitionLike;

function viewTransitionStarter(): StartViewTransition | null {
  if (typeof document === "undefined") return null;
  const doc = document as Document & {
    startViewTransition?: StartViewTransition;
  };
  return typeof doc.startViewTransition === "function"
    ? doc.startViewTransition.bind(doc)
    : null;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const REVEAL_MS = 900;
const REVEAL_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * Runs `apply` (the class flip) and, where the browser can, reveals the result
 * with an iris that opens off the bottom edge.
 *
 * @param apply   what actually changes the theme
 * @param origin  the control that was pressed; only its x is used, so the
 *                circle starts under it rather than at its centre
 */
export function applyThemeWithReveal(
  apply: () => void,
  origin?: HTMLElement | null,
): void {
  const start = viewTransitionStarter();
  if (!start || prefersReducedMotion()) {
    apply();
    return;
  }

  /* The origin is the bottom edge of the window, at the control's x, so the
     circle opens upward and outward from under the button. */
  const box = origin?.getBoundingClientRect();
  const x = box ? box.left + box.width / 2 : window.innerWidth / 2;
  const y = window.innerHeight;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), y);

  const transition = start(apply);

  transition.ready
    .then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: REVEAL_MS,
          easing: REVEAL_EASE,
          pseudoElement: "::view-transition-new(root)",
        },
      );
    })
    .catch(() => {
      /* The transition was skipped, which means the theme is already applied. */
    });
}
