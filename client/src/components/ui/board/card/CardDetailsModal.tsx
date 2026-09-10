import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import type { BoardCard as BoardCardType } from "@/types/api/dashboard/board";

interface CardDetailsModalProps {
  card: BoardCardType;
  boardId: string;
  onClose: () => void;
}

export default function CardDetailsModal({
  card,
  onClose,
}: CardDetailsModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="card-details-title"
        className="w-full max-w-xl overflow-hidden border border-neutral-800 bg-[#0b0b0b] shadow-2xl shadow-black/50"
      >
        {/* Header */}
        <header className="flex items-start justify-between border-b border-neutral-800 bg-[#0d0d0d] px-5 py-4">
          <div className="min-w-0 pr-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-[#ff1f5a]" />

              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-600">
                Card details
              </p>
            </div>

            <h2
              id="card-details-title"
              className="truncate text-base font-medium tracking-tight text-neutral-100"
            >
              {card.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close card details"
            className="flex h-8 w-8 shrink-0 items-center justify-center border border-transparent text-neutral-600 transition-colors duration-150 hover:border-neutral-800 hover:bg-neutral-900 hover:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-[#ff1f5a]/50"
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={17}
              color="currentColor"
              strokeWidth={1.5}
            />
          </button>
        </header>

        {/* Content */}
        <div className="space-y-6 p-5">
          {/* Description */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-600">
                Description
              </span>

              <span className="h-px flex-1 bg-neutral-900" />
            </div>

            <div className="border border-neutral-900 bg-[#0d0d0d] px-4 py-3">
              <p className="text-sm leading-6 text-neutral-400">
                {card.description || "No description added."}
              </p>
            </div>
          </div>

          {/* Card ID */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-600">
                Card ID
              </span>

              <span className="h-px flex-1 bg-neutral-900" />
            </div>

            <div className="border border-neutral-900 bg-[#0d0d0d] px-4 py-3">
              <p className="break-all font-mono text-xs text-neutral-500">
                {card.id}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between border-t border-neutral-900 bg-[#0a0a0a] px-5 py-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-neutral-700">
            Kanban / Card
          </span>

          <button
            type="button"
            onClick={onClose}
            className="border border-neutral-800 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-neutral-500 transition-colors duration-150 hover:border-neutral-700 hover:bg-neutral-900 hover:text-neutral-200"
          >
            Close
          </button>
        </footer>
      </section>
    </div>
  );
}
