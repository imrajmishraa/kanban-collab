import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon } from "@hugeicons/core-free-icons";

interface LoadErrorProps {
  /** What failed, in the page's own words. */
  title?: string;
  /** One line on what to do about it. */
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

/**
 * The failed-to-load card: a rounded panel on the page background, the alert
 * tile on the left, the message, and one way out.
 *
 * Deliberately not a toast and not a bare line of red text: when a route's code
 * or data never arrives there is nothing else on screen, so the message has to
 * carry the whole page.
 */
export default function LoadError({
  title = "Couldn't load this page",
  description = "Something went wrong loading it. Try again.",
  onRetry,
  retryLabel = "Retry",
}: LoadErrorProps) {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center px-4 py-10">
      <div
        role="alert"
        className="
          flex w-full max-w-2xl items-start gap-5 rounded-2xl
          border border-(--hairline) bg-(--bg-root) p-6
        "
      >
        <span
          aria-hidden="true"
          className="
            flex size-12 shrink-0 items-center justify-center rounded-xl
            bg-(--danger)/10 text-(--danger)
          "
        >
          <HugeiconsIcon icon={AlertCircleIcon} size={22} strokeWidth={1.8} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-semibold tracking-tight text-(--text-primary)">
            {title}
          </p>

          <p className="mt-1 text-[14px] leading-6 text-(--text-secondary)">
            {description}
          </p>
        </div>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="
              shrink-0 cursor-pointer rounded-full bg-(--solid-bg) px-5 py-2.5
              text-[13.5px] font-medium text-(--solid-text)
              transition-opacity duration-150 hover:opacity-90
              focus-visible:ring-2 focus-visible:ring-(--brand) focus-visible:outline-none
            "
          >
            {retryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
