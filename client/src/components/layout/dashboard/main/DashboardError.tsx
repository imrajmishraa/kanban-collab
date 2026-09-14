import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, RefreshIcon } from "@hugeicons/core-free-icons";

interface DashboardErrorProps {
  onRetry: () => void;
  isRetrying?: boolean;
}

const DashboardError = ({
  onRetry,
  isRetrying = false,
}: DashboardErrorProps) => {
  return (
    <section
      role="alert"
      className="flex min-h-[40vh] items-center justify-center px-4"
    >
      <div
        className="
          relative w-full max-w-sm overflow-hidden rounded-xl
          border border-white/8 bg-white/4
          px-6 py-8 text-center
        "
      >
        {/* Top hairline */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none absolute inset-x-0 top-0 h-px
            bg-linear-to-r from-transparent via-white/15 to-transparent
          "
        />

        {/* Icon */}
        <div
          className="
            mx-auto flex size-10 items-center justify-center
            rounded-md border border-white/10 bg-white/4
          "
        >
          <HugeiconsIcon
            icon={Alert02Icon}
            size={16}
            strokeWidth={1.6}
            className="text-(--warning)"
          />
        </div>

        {/* Content */}
        <div className="mt-5">
          <h2 className="font-mono text-[13px] font-semibold text-(--text-primary)">
            Dashboard unavailable
          </h2>

          <p
            className="
              mx-auto mt-2 max-w-xs
              font-mono text-[11px] leading-5
              text-(--text-secondary)
            "
          >
            We couldn&apos;t load your dashboard data. Please try again.
          </p>
        </div>

        {/* Retry */}
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="
            group/retry mx-auto mt-6 flex h-9 cursor-pointer items-center gap-2
            rounded-full border border-white/8 bg-white/6 px-4
            font-mono text-[12px] text-(--text-primary)
            transition-colors duration-200
            hover:bg-white/10
            disabled:cursor-not-allowed disabled:opacity-50
            disabled:hover:bg-white/6
          "
        >
          <HugeiconsIcon
            icon={RefreshIcon}
            size={14}
            strokeWidth={1.6}
            className={[
              "shrink-0 text-(--text-muted)",
              "transition-colors duration-200",
              !isRetrying && "group-hover/retry:text-(--brand)",
              isRetrying && "animate-spin",
            ]
              .filter(Boolean)
              .join(" ")}
          />

          <span>{isRetrying ? "Retrying…" : "Try again"}</span>
        </button>
      </div>
    </section>
  );
};

export default DashboardError;
