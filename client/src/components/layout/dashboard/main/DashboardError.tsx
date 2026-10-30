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
      <div className="w-full max-w-sm rounded-xl border border-(--hairline) bg-(--tint-3) px-6 py-8 text-center">
        <div className="mx-auto flex size-10 items-center justify-center rounded-md border border-(--hairline)">
          <HugeiconsIcon
            icon={Alert02Icon}
            size={16}
            strokeWidth={1.6}
            className="text-(--warning)"
          />
        </div>

        <div className="mt-5">
          <h2 className="text-[13px] font-medium tracking-tight text-(--text-primary)">
            Dashboard unavailable
          </h2>

          <p className="mx-auto mt-2 max-w-xs text-[12px] leading-5 text-(--text-secondary)">
            We could not load your dashboard data. Please try{" "}
            <span className="font-medium text-(--accent) capitalize">
              again
            </span>
          </p>
        </div>

        {/* The outline partner to the header's solid primary: mirrored corners. */}
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="
            group/retry mx-auto mt-6 flex h-9 cursor-pointer items-center gap-2
            rounded-none rounded-tl-lg rounded-br-lg
            border border-(--hairline-strong) px-4
            text-[12px] text-(--text-primary)
            transition-colors duration-200
            hover:border-(--hairline-strong) hover:bg-(--tint-4) hover:text-(--text-primary)
            disabled:cursor-not-allowed disabled:opacity-50
          "
        >
          <HugeiconsIcon
            icon={RefreshIcon}
            size={14}
            strokeWidth={1.6}
            className={[
              "shrink-0 text-(--text-muted)",
              "transition-colors duration-200",
              !isRetrying && "group-hover/retry:text-(--accent)",
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
