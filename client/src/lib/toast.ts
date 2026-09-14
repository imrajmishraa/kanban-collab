import { toast } from "sonner";
import { ApiClientError } from "@/api/client";

export function toastSuccess(message: string, description?: string) {
  return toast.success(message, { description });
}

export function toastError(err: unknown, fallback = "Something went wrong.") {
  const message =
    err instanceof ApiClientError
      ? err.message
      : err instanceof Error
        ? err.message
        : fallback;

  return toast.error(message);
}

export function toastInfo(message: string, description?: string) {
  return toast.info(message, { description });
}

export function toastLoading(message: string) {
  return toast.loading(message);
}

export function toastDismiss(id?: string | number) {
  toast.dismiss(id);
}

/**
 * Wrap an async operation with loading → success/error toasts.
 * Returns the resolved value, or throws on failure.
 */
export function toastPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error?: string | ((err: unknown) => string);
  },
): Promise<T> {
  return toast
    .promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: (err) =>
        typeof messages.error === "function"
          ? messages.error(err)
          : (messages.error ??
            (err instanceof ApiClientError
              ? err.message
              : "Something went wrong.")),
    })
    .unwrap();
}
