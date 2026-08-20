import type { ReactNode } from "react";

interface BoardEmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: ReactNode;
}

const BoardEmptyState = ({
  title = "No columns yet",
  description = "Create your first column to start organizing your work.",
  actionLabel = "Add column",
  onAction,
  actionIcon,
}: BoardEmptyStateProps) => {
  return (
    <section
      className="flex min-h-90 w-full items-center justify-center rounded-md border border-neutral-800 bg-[#080808] p-8"
      aria-label="Empty board"
    >
      <div className="flex max-w-md flex-col items-center text-center">
        {/* Icon */}
        <div
          className="mb-6 flex h-12 w-12 items-center justify-center rounded-md border border-neutral-800 bg-neutral-950 text-neutral-500"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-6 w-6"
          >
            <rect x="3" y="4" width="7" height="16" rx="1" />
            <rect x="14" y="4" width="7" height="10" rx="1" />
          </svg>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-neutral-100">
            {title}
          </h2>

          <p className="font-mono text-xs leading-6 text-neutral-500">
            {description}
          </p>
        </div>

        {/* Action */}
        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className="mt-6 inline-flex h-9 items-center gap-2 rounded-md border border-[#ff1f5a]/40 bg-[#ff1f5a]/10 px-4 font-mono text-xs font-medium text-[#ff1f5a] transition-colors hover:border-[#ff1f5a]/70 hover:bg-[#ff1f5a]/15 focus:outline-none focus:ring-1 focus:ring-[#ff1f5a]/50"
          >
            {actionIcon}
            {actionLabel}
          </button>
        )}
      </div>
    </section>
  );
};

export default BoardEmptyState;
