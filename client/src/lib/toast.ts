import type { CSSProperties } from "react";

import { toast } from "sonner";

import { ApiClientError } from "@/services/client";

/**
 * The two calls the app makes.
 *
 * Durations differ on purpose: a success is read in a glance and can leave, an
 * error has to be read *and* acted on, so it stays twice as long. Everything
 * else about how they look lives in `components/toaster/Toaster.tsx` — this
 * file is the API, not the surface.
 */

const SUCCESS_MS = 3000;
const ERROR_MS = 6000;

/**
 * Successes that should read as a moment rather than a notification — signing
 * in, finishing onboarding. Same library, different surface: sonner paints from
 * `--normal-bg`, so overriding the variable recolours the toast *and* the close
 * button that sits on it.
 */
const AUTH_MS = 2500;

const AUTH_SURFACE = {
  "--normal-bg": "var(--auth)",
  "--normal-border": "color-mix(in srgb, var(--auth) 70%, black)",
  "--normal-text": "var(--auth-ink)",
} as CSSProperties;

export type ToastVariant = "default" | "auth";

export interface ToastOptions {
  /** `auth` paints the toast with the brand-blue auth surface. */
  variant?: ToastVariant;
  /** Override the lifetime for this one toast. */
  duration?: number;
}

export function toastSuccess(
  message: string,
  description?: string,
  { variant = "default", duration }: ToastOptions = {},
) {
  const auth = variant === "auth";

  return toast.success(message, {
    description,
    duration: duration ?? (auth ? AUTH_MS : SUCCESS_MS),
    ...(auth && { style: AUTH_SURFACE }),
  });
}

export function toastError(err: unknown, fallback = "Something went wrong.") {
  const message =
    err instanceof ApiClientError
      ? err.message
      : err instanceof Error
        ? err.message
        : fallback;

  return toast.error(message, { duration: ERROR_MS });
}
