import { useMemo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  Delete02Icon,
  PinIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";

import { BoardActionsMenu } from "./BoardActionsMenu";
import { groupBoardsByTime } from "@/utils/boardGrouping";

import type { Board } from "@/types/api/dashboard/board";

interface SidebarSelectModeProps {
  boards: Board[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onClose: () => void;
  onPin: (ids: string[]) => void;
  onDelete: (ids: string[]) => void;

  onPinBoard?: (boardId: string) => void;
  onRenameBoard?: (boardId: string) => void;
  onShareBoard?: (boardId: string) => void;
  onDeleteBoard?: (boardId: string) => void;
  pinnedBoardIds?: string[];
}

export function SidebarSelectMode({
  boards,
  selected,
  onToggle,
  onClose,
  onPin,
  onDelete,
  onPinBoard,
  onRenameBoard,
  onShareBoard,
  onDeleteBoard,
  pinnedBoardIds = [],
}: SidebarSelectModeProps) {
  const { pinnedBoards, timeGroups } = useMemo(() => {
    const pinned = boards.filter((b) => pinnedBoardIds.includes(b.id));
    const unpinned = boards.filter((b) => !pinnedBoardIds.includes(b.id));
    return {
      pinnedBoards: pinned,
      timeGroups: groupBoardsByTime(unpinned),
    };
  }, [boards, pinnedBoardIds]);

  const selectedIds = Array.from(selected);
  const hasSelection = selectedIds.length > 0;

  const renderBoardRow = (board: Board) => {
    const isSelected = selected.has(board.id);
    const isPinned = pinnedBoardIds.includes(board.id);

    return (
      <div
        key={board.id}
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}
        onClick={() => onToggle(board.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle(board.id);
          }
        }}
        className={[
          "group/board relative flex h-9 cursor-pointer items-center gap-2.5 rounded-md px-2 text-left transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand)/40",
          isSelected ? "bg-white/5" : "hover:bg-white/3",
        ].join(" ")}
      >
        <span
          className={[
            "flex size-4 shrink-0 items-center justify-center rounded-full border transition-all",
            isSelected
              ? "border-(--brand) bg-(--brand) text-white"
              : "border-white/25 bg-transparent group-hover/board:border-white/40",
          ].join(" ")}
        >
          {isSelected && (
            <HugeiconsIcon icon={Tick02Icon} size={9} strokeWidth={3} />
          )}
        </span>

        <div className="relative min-w-0 flex-1 pr-7">
          <span className="block truncate text-[12px] leading-tight text-(--text-secondary)">
            {board.name}
          </span>

        </div>

        <div
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          className="absolute right-1 top-1/2 z-20 -translate-y-1/2"
        >
          <BoardActionsMenu
            isPinned={isPinned}
            onPin={() => onPinBoard?.(board.id)}
            onRename={() => onRenameBoard?.(board.id)}
            onShare={() => onShareBoard?.(board.id)}
            onDelete={() => onDeleteBoard?.(board.id)}
          />
        </div>
      </div>
    );
  };

  const isEmpty = pinnedBoards.length === 0 && timeGroups.length === 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div className="flex h-10 shrink-0 items-center justify-between px-3">
        <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-(--text-secondary)">
          Select boards
        </h2>

        <div className="group/tooltip relative">
          <button
            type="button"
            onClick={onClose}
            aria-label="Exit multi-select"
            className="flex size-6 cursor-pointer items-center justify-center rounded-full text-(--text-muted) transition-colors hover:bg-white/6 hover:text-(--text-primary)"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={13} strokeWidth={1.8} />
          </button>

          <div
            role="tooltip"
            className="pointer-events-none absolute right-0 top-full z-50 mt-1.5 hidden whitespace-nowrap rounded-md bg-white/12 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.7)] backdrop-blur-md transition-opacity duration-100 group-hover/tooltip:block group-hover/tooltip:opacity-100"
          >
            Exit multi-select
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {isEmpty ? (
          <p className="py-10 text-center font-mono text-[11px] text-(--text-muted)">
            No boards available
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {pinnedBoards.length > 0 && (
              <section>
                <div className="mb-1 flex items-center justify-between px-1.5">
                  <span className="font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-(--text-muted)">
                    Pinned
                  </span>
                </div>
                <div className="flex flex-col gap-px">
                  {pinnedBoards.map(renderBoardRow)}
                </div>
              </section>
            )}

            {timeGroups.map((group) => (
              <section key={group.label}>
                <h3 className="mb-1 px-1.5 font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-(--text-muted)">
                  {group.label}
                </h3>
                <div className="flex flex-col gap-px">
                  {group.boards.map(renderBoardRow)}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0">
        <div className="grid grid-cols-2">
          <button
            type="button"
            onClick={() => onPin(selectedIds)}
            disabled={!hasSelection}
            className="flex h-9 items-center justify-center gap-1.5 font-mono text-[11px] text-(--text-secondary) transition-colors hover:bg-white/4 hover:text-(--text-primary) disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <HugeiconsIcon icon={PinIcon} size={12} strokeWidth={1.8} />
            <span>Pin</span>
          </button>

          <button
            type="button"
            onClick={() => onDelete(selectedIds)}
            disabled={!hasSelection}
            className="flex h-9 items-center justify-center gap-1.5 font-mono text-[11px] text-(--text-secondary) transition-colors hover:bg-(--danger)/8 hover:text-(--danger) disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <HugeiconsIcon icon={Delete02Icon} size={12} strokeWidth={1.8} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
