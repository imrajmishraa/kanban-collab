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

