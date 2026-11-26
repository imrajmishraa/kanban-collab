import type { CssVars } from "@/lib/toastTokens";

import { ANIMATION_CLASS } from "./toasterVariants";
import type {
  AnimationOptions,
  ProgressOptions,
  ToastAnimation,
  ToasterConfig,
} from "./toasterTypes";

/**
 * How a toast arrives, and how long it says it has left.
 *
 * Both are about time rather than paint, which is why they are here and not in
 * `toasterResolve.ts` — that file merges configuration, this one turns a
 * duration into classes and variables.
 */

export const join = (...parts: Array<string | false | undefined>) =>
  parts.filter(Boolean).join(" ");

const DEFAULT_EASING = "cubic-bezier(0.21,0.47,0.32,0.98)";
const DEFAULT_ANIMATION_MS = 300;

/**
 * What moves, for how long, and how.
 *
 * `enter` and `exit` become state-scoped classes: sonner marks the element
 * `data-mounted` while it animates in and `data-removed` while it leaves, so the
 * two can run different properties. When they are the same the plain utility is
 * enough, and that is the case a reader should have to think about least.
 */
export function resolveAnimation(animation: ToasterConfig["animation"]): {
  classes: string;
  duration: number;
  easing: string;
} {
  const options: AnimationOptions =
    typeof animation === "string" ? { enter: animation } : (animation ?? {});
  const enter: ToastAnimation = options.enter ?? "scale";
  const exit: ToastAnimation = options.exit ?? enter;

  return {
    classes: join(
      enter === exit
        ? ANIMATION_CLASS[enter]
        : join(
            `[&[data-mounted=true]]:${ANIMATION_CLASS[enter]}`,
            `[&[data-removed=true]]:${ANIMATION_CLASS[exit]}`,
          ),
      "!duration-[var(--toast-anim-duration)]",
      "!ease-[var(--toast-anim-ease)]",
      (options.respectReducedMotion ?? true) &&
        "motion-reduce:!transition-none",
    ),
    duration: options.duration ?? DEFAULT_ANIMATION_MS,
    easing: options.easing ?? DEFAULT_EASING,
  };
}

/**
 * The rail, as the toast's own `::after`.
 *
 * Nothing extra to render, nothing to push out of place by long content, and no
 * second timer: it runs off `--toast-progress-duration`, which is the stack's
 * lifetime, so the rail and the dismissal cannot disagree.
 */
export function resolveProgress(
  progress: ProgressOptions | undefined,
  duration: number,
): { classes: string; vars: CssVars } {
  if (!progress?.visible) return { classes: "", vars: {} };

  return {
    classes: join(
      "!relative !overflow-hidden",
      "after:absolute after:inset-x-0 after:content-['']",
      progress.position === "top" ? "after:top-0" : "after:bottom-0",
      "after:h-[var(--toast-progress-thickness)]",
      "after:bg-(--toast-progress)",
      progress.animated !== false &&
        "after:origin-left after:[animation:toast-progress_var(--toast-progress-duration)_linear_forwards]",
    ),
    vars: {
      "--toast-progress-duration": `${duration}ms`,
      ...(progress.thickness !== undefined && {
        "--toast-progress-thickness": `${progress.thickness}px`,
      }),
      ...(progress.color !== undefined && {
        "--toast-progress": progress.color,
      }),
    },
  };
}
