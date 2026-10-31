interface ViewTransitionLike {
  ready: Promise<void>;
  finished: Promise<void>;
  /** Not in lib.dom's older typings; every browser that has the API has it. */
  skipTransition?: () => void;
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
const REVEAL_MS_GROW = 1200;
const REVEAL_MS_COLLAPSE = 900;

const REVEAL_EASE_GROW = "cubic-bezier(0.22, 1, 0.36, 1)";
const REVEAL_EASE_COLLAPSE = "cubic-bezier(0.6, 0, 0.4, 1)";

/* A tap this soon after the previous one is a repeat, not a fresh decision.

   A view transition is not free: it snapshots the whole page, and starting one
   over a running one makes the browser tear the old snapshots down, which is a
   full-frame jump from one theme to the other. Six taps in a second therefore
   became six of those jumps — the page flashing between the two themes with no
   iris at all. Repeats now switch instantly instead, and only a deliberate tap
   gets the reveal. */
const COALESCE_MS = 200;

/** One run of the iris: the transition, and the clip animation driving it. */
interface RevealRun {
  transition: ViewTransitionLike | null;
  reveal: Animation | null;
  /** False once a newer run (or the instant path) has taken over. */
  alive: boolean;
}

/* The reveal currently on screen, if any. */
let current: RevealRun | null = null;

/** When the last tap happened, in `performance.now()` terms. */
let lastTap = Number.NEGATIVE_INFINITY;

function clearDirectionClasses(): void {
  const root = document.documentElement;
  root.classList.remove("vt-collapse", "vt-grow"); // vt-running removed from here
}

let lockTimer: ReturnType<typeof setTimeout> | null = null;

function lockControl(ms: number): void {
  const root = document.documentElement;
  root.classList.add("vt-running");
  if (lockTimer !== null) clearTimeout(lockTimer);
  lockTimer = setTimeout(() => {
    lockTimer = null;
    root.classList.remove("vt-running");
  }, ms);
}

function unlockControl(): void {
  if (lockTimer !== null) {
    clearTimeout(lockTimer);
    lockTimer = null;
  }
  document.documentElement.classList.remove("vt-running");
}

/**
 * Tears the running reveal down: stop its animation (it owns the clip-path),
 * end its transition (it owns the snapshot layers), and let the caller restate
 * the direction. Safe to call when nothing is running.
 */
function abortCurrent(): void {
  const run = current;
  if (!run) return;
  current = null;
  run.alive = false;
  try {
    run.reveal?.cancel();
  } catch {
    /* Already finished or detached; nothing to cancel. */
  }
  try {
    run.transition?.skipTransition?.();
  } catch {
    /* Transition already torn down. */
  }
}

/**
 * Runs `apply` (the class flip) and, where the browser can, reveals the result
 * with an iris that opens out of the control that was pressed.
 *
 * A tap that arrives while an iris is still running, or right after the
 * previous tap, switches instantly instead: one transition owns the frame at a
 * time, and repeats never queue a second iris behind the first.
 *
 * @param apply   what actually changes the theme
 * @param origin  the control that was pressed; the circle starts at its centre
 */
export function applyThemeWithReveal(
  apply: () => void,
  origin?: HTMLElement | null,
): void {
  const start = viewTransitionStarter();
  const now =
    typeof performance !== "undefined" ? performance.now() : Date.now();
  const repeat = now - lastTap < COALESCE_MS || current !== null;
  lastTap = now;

  /* Instant path: no snapshots, no clip, and nothing half-finished left on
     screen. Anything already running is torn down first, so its layers cannot
     sit on top of the theme that is about to be applied. */
  if (!start || prefersReducedMotion() || repeat) {
    abortCurrent();
    unlockControl();
    clearDirectionClasses();
    apply();
    return;
  }

  abortCurrent();
  unlockControl();
  clearDirectionClasses();

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

  /* State the direction rather than only adding it: a class left behind by an
     interrupted run would invert the layer order for this one. Going light also
     pre-clips the incoming frame, so it is not painted whole for the few frames
     between the snapshot and `ready`. */
  root.classList.toggle("vt-collapse", goingDark);
  root.classList.toggle("vt-grow", !goingDark);
  /* Optional: lets CSS disable the control for the length of the reveal. See
     the `.vt-running` rule in index.css if you want the input locked. */
  root.classList.add("vt-running");
  root.style.setProperty("--vt-seed", "0px");
  root.style.setProperty("--vt-x", `${x}px`);
  root.style.setProperty("--vt-y", `${y}px`);

  lockControl(
    (goingDark ? REVEAL_MS_COLLAPSE : REVEAL_MS_GROW) + COALESCE_MS + 600,
  );

  const run: RevealRun = { transition: null, reveal: null, alive: true };
  current = run;

  const finish = () => {
    if (!run.alive) return;
    run.alive = false;
    if (current === run) current = null;
    clearDirectionClasses();
    unlockControl();
  };

  const transition = start(apply);
  run.transition = transition;

  transition.ready
    .then(() => {
      /* A newer run has already taken the frame; this snapshot is dead. */
      if (!run.alive) return;

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

      run.reveal = reveal;

      /* Clean up after the animation, not the transition: the stacking flip has
         to outlive the clip. An aborted run must not clean up after the run
         that replaced it, so `finish` checks `alive` first. */
      reveal.finished.catch(() => {}).finally(finish);
    })
    .catch(() => {
      /* The transition was skipped, which means the theme is already applied. */
      finish();
    });
}
