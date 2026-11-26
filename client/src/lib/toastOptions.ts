import type { ReactNode } from "react";
import type { ExternalToast } from "sonner";
import {
  TOAST_MS,
  toneSurface,
  type CssVars,
  type ToastFill,
  type ToastTone,
} from "@/lib/toastTokens";

/**
 * What a toast is made of: its options, and the one function that turns them
 * into the object sonner accepts.
 *
 * Split from `toast.ts` when the pair crossed the 300-line budget for a `.ts`
 * (`docs/change-rules.md` §3). The public calls are the half a caller reads;
 * this is the half they never open.
 *
 * The API for raising a toast.
 *
 * Durations and surfaces are not decided here: `lib/toastTokens.ts` holds the one
 * table of both, and `components/toaster/Toaster.tsx` holds how they are painted.
 * This file is the call — what happened, and which of sonner's per-toast
 * attributes it carries.
 *
 * The distinction that matters: a `Toaster` prop reaches *every* toast; these
 * options reach *one*. Anything a single toast needs — an id so it replaces
 * rather than stacks, an undo button, a surface of its own — belongs here.
 */

export type ToastKind = "success" | "error" | "info" | "warning";

/** One button on a toast: "Undo", "Retry", "View". */
export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  /** Surface for this toast. `auth` is the blue moment, not a result. */
  tone?: ToastTone;
  /** How hard that tone is applied: fill, tint or edge. */
  fill?: ToastFill;
  /**
   * The description's own tone. A neutral toast with one warning line in it is
   * the reason this exists — the same attribute the tooltip carries.
   */
  descriptionTone?: ToastTone;
  /** A glyph for this one toast, in place of its kind's. */
  icon?: ReactNode;
  /**
   * A value the toast offers to copy — an invite link, an id. Renders sonner's
   * action button, so it is ignored when `action` is set.
   */
  copyValue?: string;
  /**
   * Wait this many ms before showing it. A 200ms delay is how a fast save stops
   * flashing a toast at all; the returned value is the timer, not a toast id, so
   * pass your own `id` if you need to dismiss it.
   */
  delay?: number;
  /** Override the lifetime for this one toast. */
  duration?: number;
  /**
   * A stable id. Firing again with the same id *replaces* the toast instead of
   * stacking a second one — "Saving…" becoming "Saved" rather than both.
   */
  id?: string | number;
  /** The primary button. Destructive actions want one; so does a failed save. */
  action?: ToastAction;
  /** The quieter second button. */
  cancel?: ToastAction;
  /** Whether a swipe dismisses this toast. */
  dismissible?: boolean;
  /** Override the close button for this one toast. */
  closeButton?: boolean;
  onDismiss?: () => void;
  onAutoClose?: () => void;
  /**
   * Re-firing the same kind and message replaces the toast instead of stacking a
   * second one. A poll that fails on every tick is the case: twenty identical
   * errors are one error. An explicit `id` still wins.
   */
  preventDuplicate?: boolean;
  /** Which stack this toast belongs to — the `id` on the `Toaster`. */
  toasterId?: string;
  /** A stable handle for a test, instead of querying sonner's DOM by hand. */
  testId?: string;
}

/**
 * One lifetime per kind, read from the shared table. A success is read at a
 * glance and can leave; an error has to be read *and* acted on, so it stays
 * twice as long; info and a warning sit in between.
 */
const DURATION_BY_KIND: Record<ToastKind, number> = {
  success: TOAST_MS.success,
  error: TOAST_MS.error,
  info: TOAST_MS.default,
  warning: TOAST_MS.default,
};

/**
 * Writing to the clipboard is best-effort. A denied permission, an insecure
 * context or a browser without the API is not an error worth a toast about.
 */
function copy(value: string) {
  const written = globalThis.navigator?.clipboard?.writeText(value);

  void written?.catch(() => undefined);
}

/**
 * The per-toast attributes sonner accepts, built in one place so every kind
 * carries them the same way.
 */
export function build(kind: ToastKind, options: ToastOptions): ExternalToast {
  const {
    tone,
    fill = "solid",
    descriptionTone,
    icon,
    copyValue,
    duration,
    id,
    action,
    cancel,
    dismissible,
    closeButton,
    onDismiss,
    onAutoClose,
    toasterId,
    testId,
  } = options;

  const surface: CssVars = tone === undefined ? {} : toneSurface(tone, fill);
  const descriptionInk =
    descriptionTone === undefined
      ? undefined
      : toneSurface(descriptionTone)["--toast-description"];

  const style: CssVars = {
    ...surface,
    ...(descriptionInk !== undefined && {
      "--toast-description": descriptionInk,
    }),
  };

  return {
    /* A moment dismisses faster than a result: `auth` is the short lifetime. */
    duration:
      duration ?? (tone === "auth" ? TOAST_MS.moment : DURATION_BY_KIND[kind]),
    ...(Object.keys(style).length > 0 && { style }),
    ...(icon !== undefined && { icon }),
    /* One button, not two: an action the caller chose wins over a copy. */
    ...(copyValue !== undefined &&
      action === undefined && {
        action: { label: "Copy", onClick: () => copy(copyValue) },
      }),
    ...(id !== undefined && { id }),
    ...(action && { action }),
    ...(cancel && { cancel }),
    ...(dismissible !== undefined && { dismissible }),
    ...(closeButton !== undefined && { closeButton }),
    ...(onDismiss && { onDismiss: () => onDismiss() }),
    ...(onAutoClose && { onAutoClose: () => onAutoClose() }),
    ...(toasterId !== undefined && { toasterId }),
    ...(testId !== undefined && { testId }),
  };
}

/**
 * Show now, or in `delay` ms.
 *
 * A delayed toast has no id yet, so the timer is what comes back. That is the
 * honest return: dismissing a toast that has not been created is not a thing.
 */
export function fire(
  run: () => string | number,
  delay?: number,
): string | number {
  if (delay === undefined || delay <= 0) return run();

  /* The DOM types say number, the Node types say Timeout; both runtimes hand
     back something that identifies the timer. */
  const timer = globalThis.setTimeout(run, delay);

  return typeof timer === "number" ? timer : Number(timer);
}

/**
 * A stable id for a repeated message.
 *
 * sonner already replaces a toast whose id it has seen, so this needs no state of
 * its own: the same kind and message derive the same id, and the stack keeps one
 * of them.
 */
export function dedupe(
  kind: ToastKind,
  message: string,
  options: ToastOptions,
): ToastOptions {
  return options.preventDuplicate && options.id === undefined
    ? { ...options, id: `${kind}:${message}` }
    : options;
}

/** A description is a second line, not a second toast. */
export const withDescription = (
  built: ExternalToast,
  description?: string,
): ExternalToast =>
  description === undefined ? built : { ...built, description };

export interface PromiseMessages<Data> {
  loading: string;
  success: string | ((data: Data) => string);
  error: string | ((error: unknown) => string);
}
