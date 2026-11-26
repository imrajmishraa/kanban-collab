import { toast } from "sonner";

import { ApiClientError } from "@/services/client";

import {
  build,
  dedupe,
  fire,
  withDescription,
  type PromiseMessages,
  type ToastOptions,
} from "./toastOptions";

export type {
  PromiseMessages,
  ToastAction,
  ToastKind,
  ToastOptions,
} from "./toastOptions";

/**
 * The calls the app makes.
 *
 * Durations and surfaces are not decided here: `lib/toastTokens.ts` holds the one
 * table of both, and `components/toaster/` holds how they are painted. This file
 * is the call — what happened, and which of sonner's per-toast attributes it
 * carries.
 *
 * The distinction that matters: a `Toaster` prop reaches *every* toast; these
 * options reach *one*. Anything a single toast needs — an id so it replaces
 * rather than stacks, an undo button, a surface of its own — belongs here.
 */

export function toastSuccess(
  message: string,
  description?: string,
  options: ToastOptions = {},
) {
  return fire(
    () =>
      toast.success(
        message,
        withDescription(
          build("success", dedupe("success", message, options)),
          description,
        ),
      ),
    options.delay,
  );
}

export function toastInfo(
  message: string,
  description?: string,
  options: ToastOptions = {},
) {
  return fire(
    () =>
      toast.info(
        message,
        withDescription(
          build("info", dedupe("info", message, options)),
          description,
        ),
      ),
    options.delay,
  );
}

export function toastWarning(
  message: string,
  description?: string,
  options: ToastOptions = {},
) {
  return fire(
    () =>
      toast.warning(
        message,
        withDescription(
          build("warning", dedupe("warning", message, options)),
          description,
        ),
      ),
    options.delay,
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

  return fire(
    () =>
      toast.error(message, build("error", dedupe("error", message, options))),
    options.delay,
  );
}

/**
 * A toast that stays until something replaces it. Pair it with an `id` and a
 * later `toastSuccess(..., { id })`, and the spinner becomes the result in place.
 */
export function toastLoading(message: string, options: ToastOptions = {}) {
  return fire(
    () =>
      toast.loading(message, {
        ...build("info", options),
        duration: options.duration ?? Infinity,
      }),
    options.delay,
  );
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
