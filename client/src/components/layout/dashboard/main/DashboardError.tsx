import { AlertTriangle, RefreshCw } from "lucide-react";

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
      className="flex min-h-[40vh] items-center justify-center"
    >
      <div className="w-full max-w-md border border-neutral-800 bg-[#0b0b0b] px-6 py-8 text-center">
        {/* Icon */}
        <div className="mx-auto flex size-10 items-center justify-center border border-neutral-800 bg-white/2">
          <AlertTriangle className="size-4 text-rose-500" />
        </div>

        {/* Content */}
        <div className="mt-5">
          <h2 className="font-mono text-sm font-semibold text-neutral-200">
            Dashboard unavailable
          </h2>

          <p className="mx-auto mt-2 max-w-sm font-mono text-xs leading-5 text-neutral-600">
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
            "border border-neutral-800 px-4",
            "font-mono text-xs",
            "transition-colors duration-150",
            isRetrying
              ? "cursor-not-allowed text-neutral-700"
              : "cursor-pointer text-neutral-400 hover:border-neutral-700 hover:bg-white/4 hover:text-neutral-200",
          ].join(" ")}
        >
          <RefreshCw
            className={["size-3.5", isRetrying ? "animate-spin" : ""].join(" ")}
          />

          <span>{isRetrying ? "Retrying..." : "Try again"}</span>
        </button>
      </div>
    </section>
  );
};

export default DashboardError;
