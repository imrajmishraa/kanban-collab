import type { ReactNode } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import { AddCircleIcon } from "@hugeicons/core-free-icons";

import type { PaletteRow, Scope } from "./types";

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-2 pb-1 pt-3 text-[11px] font-medium text-(--text-muted)">
      {children}
    </p>
  );
}

function Hint({
  children,
  danger = false,
}: {
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <p
      className={[
        "px-2.5 py-2 text-[12.5px]",
        danger ? "text-(--danger)" : "text-(--text-muted)",
      ].join(" ")}
    >
      {children}
    </p>
  );
}

interface SearchResultsProps {
  scope: Scope;
  rows: PaletteRow[];
  activeIndex: number;
  trimmed: string;
  hasActiveBoard: boolean;
  lastBoardId: string | null;
  isSearching: boolean;
  isSearchError: boolean;
  onHoverRow: (index: number) => void;
  onOpenRow: (row: PaletteRow) => void;
  onOpenBoard: (boardId: string) => void;
}

/** Left column: the actions block, the section head and the result rows. */
export function SearchResults({
  scope,
  rows,
  activeIndex,
  trimmed,
  hasActiveBoard,
  lastBoardId,
  isSearching,
  isSearchError,
  onHoverRow,
  onOpenRow,
  onOpenBoard,
}: SearchResultsProps) {
  return (
    <div className="w-[46%] shrink-0 overflow-y-auto border-r border-(--hairline) p-2">
      {scope === "cards" && hasActiveBoard && lastBoardId && (
        <>
          <SectionLabel>Actions</SectionLabel>
          <button
            type="button"
            onClick={() => onOpenBoard(lastBoardId)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors duration-200 hover:bg-(--bg-hover)"
          >
            <HugeiconsIcon
              icon={AddCircleIcon}
              size={15}
              strokeWidth={1.6}
              className="shrink-0 text-(--text-muted)"
            />
            <span className="min-w-0 flex-1 truncate text-[13px] text-(--text-primary)">
              Open board to add a card
            </span>
          </button>
        </>
      )}

      <SectionLabel>{scope === "cards" ? "Cards" : "Boards"}</SectionLabel>

      {scope === "cards" && !hasActiveBoard ? (
        <Hint>
          Open a board first, card search runs inside the active board
        </Hint>
      ) : scope === "cards" && trimmed.length === 1 ? (
        <Hint>Keep typing, two characters minimum</Hint>
      ) : scope === "cards" && isSearching ? (
        <Hint>Searching…</Hint>
      ) : scope === "cards" && isSearchError ? (
        <Hint danger>Search failed. Please try again.</Hint>
      ) : rows.length === 0 ? (
        <Hint>
          {trimmed ? `Nothing matches “${trimmed}”` : "No results yet"}
        </Hint>
      ) : (
        <ul role="listbox" aria-label="Results">
          {rows.map((row, index) => {
            const selected = index === activeIndex;

            return (
              <li key={row.key} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => onOpenRow(row)}
                  onMouseEnter={() => onHoverRow(index)}
                  className={[
                    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors duration-200",
                    selected ? "bg-(--tint-7)" : "hover:bg-(--bg-hover)",
                  ].join(" ")}
                >
                  <HugeiconsIcon
                    icon={row.icon}
                    size={15}
                    strokeWidth={1.6}
                    className="shrink-0 text-(--text-muted)"
                  />
                  <span className="min-w-0 flex-1 truncate text-[13px] text-(--text-primary)">
                    {row.title}
                  </span>
                  {row.meta && (
                    <span className="shrink-0 text-[11px] text-(--text-muted)">
                      {row.meta}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
