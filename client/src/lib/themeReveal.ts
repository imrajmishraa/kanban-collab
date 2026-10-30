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

/* Two durations and two curves, one pair per direction.

   Dark to light grows a circle from the button to the whole viewport, so it has
   the long run. Light to dark is the same gesture backwards: the light frame
   closes into the button and uncovers the dark page, so it starts at full size
   and gets a shorter run with a curve that leaves immediately. */
const REVEAL_MS_GROW = 2000;
const REVEAL_MS_COLLAPSE = 1500;

const REVEAL_EASE_GROW = "cubic-bezier(0.22, 1, 0.36, 1)";
const REVEAL_EASE_COLLAPSE = "cubic-bezier(0.6, 0, 0.4, 1)";

/**
 * Runs `apply` (the class flip) and, where the browser can, reveals the result
 * with an iris that opens out of the control that was pressed.
 *
 * @param apply   what actually changes the theme
 * @param origin  the control that was pressed; the circle starts at its centre
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

  const root = document.documentElement;

  /* Which way are we going? The class is still the old one, because this runs
     before the snapshot callback flips it. */
  const goingDark = root.classList.contains("light");

  /* The origin is the button itself, so the circle opens out of the control
     rather than off the bottom edge of the window. */
  const box = origin?.getBoundingClientRect();
  const x = box ? box.left + box.width / 2 : window.innerWidth / 2;
  const y = box ? box.top + box.height / 2 : window.innerHeight / 2;
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  const open = `circle(0px at ${x}px ${y}px)`;
  const closed = `circle(${radius}px at ${x}px ${y}px)`;

  /* Going dark the layers swap, so the outgoing light frame is the one on top
     and has something to shrink from. Rules live in index.css. */
  if (goingDark) root.classList.add("vt-collapse");

  const clearCollapse = () => root.classList.remove("vt-collapse");

  const transition = start(apply);

  transition.ready
    .then(() => {
      const reveal = root.animate(
        {
          /* Light: the new frame opens out of the button.
             Dark: the old frame closes back into it. */
          clipPath: goingDark ? [closed, open] : [open, closed],
        },
        {
          duration: goingDark ? REVEAL_MS_COLLAPSE : REVEAL_MS_GROW,
          easing: goingDark ? REVEAL_EASE_COLLAPSE : REVEAL_EASE_GROW,
          /* Hold the last frame, or the clip is dropped the moment the
             animation ends and the frame snaps back to full size for one frame
             before the snapshot is torn down. */
          fill: "both",
          pseudoElement: goingDark
            ? "::view-transition-old(root)"
            : "::view-transition-new(root)",
        },
      );

      /* Clean up after the animation, not the transition: the stacking flip has
         to outlive the clip. */
      reveal.finished.catch(() => {}).finally(clearCollapse);
    })
    .catch(() => {
      /* The transition was skipped, which means the theme is already applied. */
      clearCollapse();
    });
}
