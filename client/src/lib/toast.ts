import type { ReactNode } from "react";
import type { ExternalToast } from "sonner";

import { toast } from "sonner";

import { ApiClientError } from "@/services/client";
import {
  TOAST_MS,
  toneSurface,
  type CssVars,
  type ToastFill,
  type ToastTone,
} from "@/lib/toastTokens";

/**
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
function build(kind: ToastKind, options: ToastOptions): ExternalToast {
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

/** A description is a second line, not a second toast. */
const withDescription = (
  built: ExternalToast,
  description?: string,
): ExternalToast =>
  description === undefined ? built : { ...built, description };

export function toastSuccess(
  message: string,
  description?: string,
  options: ToastOptions = {},
) {
  return toast.success(
    message,
    withDescription(build("success", options), description),
  );
}

export function toastInfo(
  message: string,
  description?: string,
  options: ToastOptions = {},
) {
  return toast.info(
    message,
    withDescription(build("info", options), description),
  );
}

export function toastWarning(
  message: string,
  description?: string,
  options: ToastOptions = {},
) {
  return toast.warning(
    message,
    withDescription(build("warning", options), description),
  );
}

export function toastError(
  err: unknown,
  fallback = "Something went wrong.",
  options: ToastOptions = {},
) {
  const message =
    err instanceof ApiClientError
      ? err.message
      : err instanceof Error
        ? err.message
        : fallback;

  return toast.error(message, build("error", options));
}

/**
 * A toast that stays until something replaces it. Pair it with an `id` and a
 * later `toastSuccess(..., { id })`, and the spinner becomes the result in place.
 */
export function toastLoading(message: string, options: ToastOptions = {}) {
  return toast.loading(message, {
    ...build("info", options),
    duration: options.duration ?? Infinity,
  });
}

export interface PromiseMessages<Data> {
  loading: string;
  success: string | ((data: Data) => string);
  error: string | ((error: unknown) => string);
}

/**
 * One toast for a whole async operation: loading, then success or error, with
 * no second call and no orphaned spinner if it rejects.
 */
export function toastPromise<Data>(
  promise: Promise<Data> | (() => Promise<Data>),
  messages: PromiseMessages<Data>,
  options: ToastOptions = {},
) {
  return toast.promise<Data>(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
    ...build("success", options),
  });
}

export function dismissToast(id?: string | number) {
  return toast.dismiss(id);
}
