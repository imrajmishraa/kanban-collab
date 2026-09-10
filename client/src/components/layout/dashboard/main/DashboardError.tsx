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
          w-full max-w-md
          border border-(--border)
          bg-(--surface-elevated)
          px-6 py-8
          text-center
        "
      >
        {/* Icon */}
        <div
          className="
            mx-auto flex size-10
            items-center justify-center
            border border-(--border)
            bg-(--brand-muted)
          "
        >
          <HugeiconsIcon
            icon={Alert02Icon}
            size={16}
            strokeWidth={1.5}
            className="text-(--warning)"
          />
        </div>

        {/* Content */}
        <div className="mt-5">
          <h2
            className="
              font-mono text-sm font-semibold
              text-(--text-primary)
            "
          >
            Dashboard unavailable
          </h2>

          <p
            className="
              mx-auto mt-2 max-w-sm
              font-mono text-xs leading-5
              text-(--text-muted)
            "
          >
            We couldn't load your dashboard data. Please try again.
          </p>
        </div>

        {/* Retry */}
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className={[
            "mx-auto mt-6 flex h-9 items-center gap-2",
            "border px-4",
            "font-mono text-xs",
            "transition-all duration-150",
            isRetrying
              ? [
                  "cursor-not-allowed",
                  "border-(--border)",
                  "text-(--text-muted)",
                ].join(" ")
              : [
                  "cursor-pointer",
                  "border-(--border)",
                  "text-(--text-secondary)",
                  "hover:border-(--brand)",
                  "hover:bg-(--brand-muted)",
                  "hover:text-(--text-primary)",
                ].join(" "),
          ].join(" ")}
        >
          <HugeiconsIcon
            icon={RefreshIcon}
            size={14}
            strokeWidth={1.5}
            className={isRetrying ? "animate-spin" : ""}
          />

          <span>{isRetrying ? "Retrying..." : "Try again"}</span>
        </button>
      </div>
    </section>
  );
};

export default DashboardError;
