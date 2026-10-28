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
      <div className="w-full max-w-sm rounded-xl border border-orange-50/15 bg-white/3 px-6 py-8 text-center">
        <div className="mx-auto flex size-10 items-center justify-center rounded-md border border-orange-50/15">
          <HugeiconsIcon
            icon={Alert02Icon}
            size={16}
            strokeWidth={1.6}
            className="text-amber-300"
          />
        </div>

        <div className="mt-5">
          <h2 className="text-[13px] font-medium tracking-tight text-neutral-100">
            Dashboard unavailable
          </h2>

          <p className="mx-auto mt-2 max-w-xs text-[12px] leading-5 text-neutral-400">
            We could not load your dashboard data. Please try{" "}
            <span className="font-medium text-orange-100 capitalize">
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
            border border-orange-50/20 px-4
            text-[12px] text-neutral-200
            transition-colors duration-200
            hover:border-orange-50/35 hover:bg-white/4 hover:text-neutral-100
            disabled:cursor-not-allowed disabled:opacity-50
          "
        >
          <HugeiconsIcon
            icon={RefreshIcon}
            size={14}
            strokeWidth={1.6}
            className={[
              "shrink-0 text-neutral-500",
              "transition-colors duration-200",
              !isRetrying && "group-hover/retry:text-orange-100",
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
