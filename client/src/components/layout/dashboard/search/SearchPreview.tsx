import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

import type { PaletteRow, Scope } from "./types";

interface SearchPreviewProps {
  active: PaletteRow | undefined;
  scope: Scope;
  onOpen: (row: PaletteRow) => void;
}

/** Right column: a summary of the highlighted row, or the empty state. */
export function SearchPreview({ active, scope, onOpen }: SearchPreviewProps) {
  if (!active) {
    return (
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <p className="m-auto text-[12.5px] text-(--text-subtle)">
          Select a result to preview
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col p-4">
      <div className="flex items-start gap-2.5">
        <HugeiconsIcon
          icon={active.icon}
          size={16}
          strokeWidth={1.6}
          className="mt-0.5 shrink-0 text-(--text-muted)"
        />
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-medium text-(--text-primary)">
            {active.title}
          </p>
          {active.meta && (
            <p className="mt-0.5 text-[11.5px] text-(--text-muted)">
              {scope === "cards" ? "Board" : "Updated"}:{" "}
              <span className="font-medium capitalize text-(--accent)">
                {active.meta}
              </span>
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onOpen(active)}
        className="mt-auto flex h-9 items-center justify-center gap-1.5 rounded-none rounded-tr-lg rounded-bl-lg bg-(--solid-bg) px-4 text-[12px] font-semibold text-(--solid-text) transition-colors duration-200 hover:bg-(--solid-bg-hover)"
      >
        Open board
        <HugeiconsIcon icon={ArrowRight01Icon} size={13} strokeWidth={2} />
      </button>
    </div>
  );
}
