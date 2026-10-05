import { HugeiconsIcon } from "@hugeicons/react";
import { Refresh01Icon, TriangleAlertIcon } from "@hugeicons/core-free-icons";

interface BoardErrorProps {
  message?: string;
  onRetry?: () => void;
}

export default function BoardError({
  message = "Something went wrong while loading this board.",
  onRetry,
}: BoardErrorProps) {
  return (
    <div
      role="alert"
      className="flex h-full min-h-100 items-center justify-center bg-(--bg-root) px-6"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-white/8 bg-white/4 p-6 text-center">
        {/* Top hairline — same accent as every other panel */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/15 to-transparent"
        />

        <div className="mx-auto flex size-10 items-center justify-center rounded-md border border-white/10 bg-white/4 text-(--danger)">
          <HugeiconsIcon icon={TriangleAlertIcon} size={18} strokeWidth={1.6} />
        </div>

        <div className="mt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-(--danger)">
            BOARD_ERROR
          </p>

          <h2 className="mt-2 font-mono text-[13px] font-semibold text-(--text-primary)">
            Unable to load board
          </h2>

          <p className="mx-auto mt-2 max-w-sm font-mono text-[11px] leading-5 text-(--text-secondary)">
            {message}
          </p>
        </div>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="group/retry mx-auto mt-5 inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-white/8 bg-white/6 px-4 font-mono text-[12px] text-(--text-primary) transition-colors duration-200 hover:bg-white/10"
          >
            <HugeiconsIcon
              icon={Refresh01Icon}
              size={13}
              strokeWidth={1.6}
              className="shrink-0 text-(--text-muted) transition-colors duration-200 group-hover/retry:text-(--brand)"
            />
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
