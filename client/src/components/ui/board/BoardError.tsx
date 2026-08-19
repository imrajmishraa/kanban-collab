import { AlertTriangle, RefreshCw } from "lucide-react";

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
      className="flex h-full min-h-100 items-center justify-center bg-[#080808] px-6"
    >
      <div className="w-full max-w-md border border-neutral-800 bg-[#0b0b0b] p-6 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center border border-neutral-800 text-[#ff1f5a]">
          <AlertTriangle size={18} />
        </div>

        <div className="mt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#ff1f5a]">
            BOARD_ERROR
          </p>

          <h2 className="mt-2 text-base font-semibold text-neutral-200">
            Unable to load board
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-600">
            {message}
          </p>
        </div>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-5 inline-flex h-9 items-center gap-2 border border-neutral-700 px-4 font-mono text-xs text-neutral-400 transition hover:border-[#ff1f5a]/60 hover:text-neutral-200"
          >
            <RefreshCw size={13} />
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
