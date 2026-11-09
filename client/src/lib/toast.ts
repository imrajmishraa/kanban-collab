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

export function toastSuccess(message: string, description?: string) {
  return toast.success(message, { description, duration: SUCCESS_MS });
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
