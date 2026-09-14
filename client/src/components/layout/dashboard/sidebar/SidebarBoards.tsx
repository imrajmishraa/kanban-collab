import { useCallback, useEffect, useMemo, useRef } from "react";
import { NavLink } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  ListChecksIcon,
  KanbanIcon,
} from "@hugeicons/core-free-icons";

import { BoardActionsMenu } from "./BoardActionsMenu";
import { groupBoardsByTime } from "@/utils/boardGrouping";

import type { Board } from "@/types/api/dashboard/board";

interface SidebarBoardsProps {
  collapsed: boolean;
  open: boolean;
  onToggle: () => void;
  boards: Board[];
  isLoading: boolean;
  isError: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;

  pinnedBoardIds?: string[];
  onPin?: (boardId: string, pinned: boolean) => void;
  onRename?: (boardId: string) => void;
  onShare?: (boardId: string) => void;
  onDelete?: (boardId: string) => void;

  onEnterSelectMode?: () => void;
}

const SidebarBoards = ({
  collapsed,
  open,
  onToggle,
  boards = [],
  isLoading = false,
  isError = false,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  pinnedBoardIds = [],
  onPin,
  onRename,
  onShare,
  onDelete,
  onEnterSelectMode,
}: SidebarBoardsProps) => {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const { pinnedBoards, timeGroups } = useMemo(() => {
    const pinned = boards.filter((b) => pinnedBoardIds.includes(b.id));
    const unpinned = boards.filter((b) => !pinnedBoardIds.includes(b.id));
    return {
      pinnedBoards: pinned,
      timeGroups: groupBoardsByTime(unpinned),
    };
  }, [boards, pinnedBoardIds]);

  const findScrollableAncestor = useCallback(
    (el: HTMLElement | null): HTMLElement | null => {
      let current = el?.parentElement;
      while (current) {
        const style = window.getComputedStyle(current);
        if (style.overflowY === "auto" || style.overflowY === "scroll") {
          return current;
        }
        current = current.parentElement;
      }
      return null;
    },
    [],
  );

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !open || !hasNextPage) return;

    const root = findScrollableAncestor(target);

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          onLoadMore();
        }
      },
      { root, rootMargin: "150px", threshold: 0 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [
    open,
    hasNextPage,
    isFetchingNextPage,
    onLoadMore,
    findScrollableAncestor,
  ]);

  if (collapsed) return null;

  const renderBoardRow = (board: Board) => {
    const isPinned = pinnedBoardIds.includes(board.id);

    return (
      <div key={board.id} className="group/board relative">
        <NavLink
          to={`/board/${board.id}`}
          onClick={(event) => event.stopPropagation()}
          aria-label={board.name}
          className={({ isActive }) =>
            [
              "flex h-9 cursor-pointer items-center gap-2.5 rounded-md px-2",
              "text-[12px] leading-tight",
              "transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand)/40",
              isActive
                ? "bg-white/5 text-(--text-soft)"
                : "text-(--text-secondary) hover:bg-white/3 hover:text-(--text-soft)",
            ].join(" ")
          }
        >
          <HugeiconsIcon
            icon={KanbanIcon}
            size={15}
            strokeWidth={1.5}
            className="shrink-0"
          />

          <span className="min-w-0 flex-1 truncate pr-7">{board.name}</span>
        </NavLink>

        <div className="absolute right-1 top-1/2 z-20 -translate-y-1/2">
          <BoardActionsMenu
            isPinned={isPinned}
            onPin={() => onPin?.(board.id, !isPinned)}
            onRename={() => onRename?.(board.id)}
            onShare={() => onShare?.(board.id)}
            onDelete={() => onDelete?.(board.id)}
          />
        </div>
      </div>
    );
  };

  return (
    <section className="px-3 pt-3 pb-4">
      <div className="flex h-8 items-center justify-between rounded-lg px-2 transition-colors hover:bg-white/4">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex flex-1 cursor-pointer items-center gap-2"
        >
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={12}
            strokeWidth={1.8}
            className={[
              "shrink-0 text-(--text-muted) transition-transform duration-200",
              open && "rotate-90",
            ].join(" ")}
          />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-(--text-muted)">
            Boards
          </span>
        </button>

        <div className="group/tooltip relative">
          <button
            type="button"
            onClick={onEnterSelectMode}
            aria-label="Multi-select boards"
            className="flex size-6 cursor-pointer items-center justify-center rounded-full text-(--text-muted) transition-colors hover:bg-white/8 hover:text-(--text-primary)"
          >
            <HugeiconsIcon icon={ListChecksIcon} size={13} strokeWidth={1.8} />
          </button>

          <div
            role="tooltip"
            className="pointer-events-none absolute right-0 top-full z-50 mt-2 whitespace-nowrap rounded-lg bg-white/12 px-3 py-1.5 text-[12px] font-medium text-white opacity-0 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.6)] backdrop-blur-md transition-opacity duration-150 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100"
          >
            Multi-select
          </div>
        </div>
      </div>

      {open && (
        <div className="relative mt-2 overflow-hidden rounded-xl bg-(--bg-surface) shadow-[0_8px_24px_-10px_rgba(0,0,0,0.6)]">
          <div className="relative p-1">
            {isLoading && <BoardsSkeleton rows={5} />}

            {isError && !isLoading && (
              <p className="px-2.5 py-2 font-mono text-[12px] text-(--danger)">
                Unable to load boards.
              </p>
            )}

            {!isLoading && !isError && boards.length === 0 && (
              <div className="flex h-9 items-center gap-2.5 rounded-md px-2.5">
                <HugeiconsIcon
                  icon={KanbanIcon}
                  size={15}
                  strokeWidth={1.5}
                  className="shrink-0 text-(--text-muted)"
                />
                <span className="font-mono text-[12px] text-(--text-muted)">
                  No boards
                </span>
              </div>
            )}

            {!isLoading && !isError && boards.length > 0 && (
              <div className="flex flex-col gap-2">
                {pinnedBoards.length > 0 && (
                  <div>
                    <div className="mb-1 flex items-center justify-between px-2">
                      <span className="font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-(--text-muted)">
                        Pinned
                      </span>
                    </div>
                    <div className="flex flex-col gap-px">
                      {pinnedBoards.map(renderBoardRow)}
                    </div>
                  </div>
                )}

                {timeGroups.map((group) => (
                  <div key={group.label}>
                    <h3 className="mb-1 px-2 font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-(--text-muted)">
                      {group.label}
                    </h3>
                    <div className="flex flex-col gap-px">
                      {group.boards.map(renderBoardRow)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && !isError && hasNextPage && (
              <div ref={loadMoreRef} className="pt-2">
                {isFetchingNextPage ? (
                  <BoardsSkeleton rows={3} />
                ) : (
                  <LoadingDots />
                )}
              </div>
            )}

            {!isLoading && !isError && !hasNextPage && boards.length > 0 && (
              <p className="pt-2 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-(--text-muted)">
                End of list
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default SidebarBoards;

function LoadingDots() {
  return (
    <div className="flex items-center justify-center gap-1 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1 w-1 rounded-full bg-white/25"
          style={{
            animation: `sidebarLoadingDot 1.4s ease-in-out ${i * 0.15}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes sidebarLoadingDot {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50%      { opacity: 1;   transform: translateY(-2px); }
        }
      `}</style>
    </div>
  );
}

function BoardsSkeleton({ rows }: { rows: number }) {
  return (
    <div className="flex flex-col gap-1 px-2 py-1">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex h-9 items-center gap-2.5 rounded-md px-2.5"
        >
          <div className="size-4 shrink-0 animate-pulse rounded bg-white/15" />
          <div
            className="h-2.5 animate-pulse rounded-full bg-white/15"
            style={{ width: `${70 + (index % 4) * 25}px` }}
          />
        </div>
      ))}
    </div>
  );
}
