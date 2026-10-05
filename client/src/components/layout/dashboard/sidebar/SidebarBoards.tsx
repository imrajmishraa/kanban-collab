import { useCallback, useEffect, useMemo, useRef } from "react";
import { NavLink } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  KanbanIcon,
  ListChecksIcon,
} from "@hugeicons/core-free-icons";

import { Tooltip } from "@components/Tooltips/ToolTip";
import { groupBoardsByTime } from "@/utils/boardGrouping";
import type { Board } from "@/types/api/dashboard/board";

import { BoardActionsMenu } from "./BoardActionsMenu";

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

const LOAD_MORE_DELAY = 600;

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
    const pinned = boards.filter((board) => pinnedBoardIds.includes(board.id));

    const unpinned = boards.filter(
      (board) => !pinnedBoardIds.includes(board.id),
    );

    return {
      pinnedBoards: pinned,
      timeGroups: groupBoardsByTime(unpinned),
    };
  }, [boards, pinnedBoardIds]);

  const findScrollableAncestor = useCallback(
    (element: HTMLElement | null): HTMLElement | null => {
      let current = element?.parentElement;

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

    if (!target || !open || !hasNextPage) {
      return;
    }

    const root = findScrollableAncestor(target);

    let loadTimer: number | undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          window.clearTimeout(loadTimer);

          loadTimer = window.setTimeout(() => {
            if (hasNextPage && !isFetchingNextPage) {
              onLoadMore();
            }
          }, LOAD_MORE_DELAY);
        } else {
          window.clearTimeout(loadTimer);
        }
      },
      {
        root,
        rootMargin: "0px",
        threshold: 0,
      },
    );

    observer.observe(target);

    return () => {
      window.clearTimeout(loadTimer);

      observer.disconnect();
    };
  }, [
    open,
    hasNextPage,
    isFetchingNextPage,
    onLoadMore,
    findScrollableAncestor,
  ]);

  if (collapsed) {
    return null;
  }

  const renderBoardRow = (board: Board) => {
    const isPinned = pinnedBoardIds.includes(board.id);

    return (
      <div
        key={board.id}
        className="
          group/board
          relative
          flex
          min-w-0
          items-center
          overflow-visible
        "
      >
        {/* Board link */}
        <NavLink
          to={`/boards/${board.id}`}
          aria-label={board.name}
          className={({ isActive }) =>
            [
              "flex h-9 min-w-0 flex-1",
              "cursor-pointer items-center",
              "gap-2.5 rounded-md px-2",
              "text-[12px] leading-tight",
              "transition-colors duration-200",

              "focus-visible:outline-none",
              "focus-visible:ring-2",
              "focus-visible:ring-(--brand)/40",

              isActive
                ? "bg-white/5 text-(--text-soft)"
                : [
                    "text-(--text-secondary)",
                    "hover:bg-white/3",
                    "hover:text-(--text-soft)",
                  ].join(" "),
            ].join(" ")
          }
        >
          <HugeiconsIcon
            icon={KanbanIcon}
            size={15}
            strokeWidth={1.5}
            className="
              shrink-0
              text-current
            "
          />

          <span
            className="
              min-w-0
              flex-1
              truncate
            "
          >
            {board.name}
          </span>
        </NavLink>

        {/* Board actions */}
        <div
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
          className="
            absolute
            right-1
            top-1/2
            z-20
            -translate-y-1/2
            overflow-visible
          "
        >
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
    <section
      className="
        min-h-0
        px-3
        pb-4
        pt-3
      "
    >
      {/* Section header */}
      <div
        className="
          flex
          h-8
          items-center
          justify-between
          rounded-lg
          px-2
          hover:bg-white/4
        "
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="
            flex
            flex-1
            cursor-pointer
            items-center
            gap-2
          "
        >
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={12}
            strokeWidth={1.8}
            className={[
              "shrink-0",
              "text-(--text-muted)",
              "transition-transform",
              "duration-200",
              open && "rotate-90",
            ]
              .filter(Boolean)
              .join(" ")}
          />

          <span
            className="
              font-mono
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.2em]
              text-(--text-muted)
            "
          >
            Boards
          </span>
        </button>

        <Tooltip label="Multi-select" side="bottom" shape="solid" size="sm">
          <button
            type="button"
            onClick={onEnterSelectMode}
            aria-label="Multi-select boards"
            className="
              flex
              size-6
              cursor-pointer
              items-center
              justify-center
              rounded-full
              text-(--text-muted)
              transition-colors

              hover:bg-white/8
              hover:text-(--text-primary)

              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-(--brand)/40
            "
          >
            <HugeiconsIcon icon={ListChecksIcon} size={13} strokeWidth={1.8} />
          </button>
        </Tooltip>
      </div>

      {/* Board list */}
      {open && (
        <div
          className="
            relative
            mt-2
            h-full
            min-h-0
            overflow-visible
            rounded-xl
            bg-(--bg-surface)
          "
        >
          <div
            className="
              relative
              overflow-visible
              p-1
            "
          >
            {/* Loading */}
            {isLoading && <BoardsSkeleton rows={5} />}

            {/* Error */}
            {isError && !isLoading && (
              <p
                className="
                    px-2.5
                    py-2
                    font-mono
                    text-[12px]
                    text-(--danger)
                  "
              >
                Unable to load boards.
              </p>
            )}

            {/* Empty */}
            {!isLoading && !isError && boards.length === 0 && (
              <div
                className="
                    flex
                    h-9
                    items-center
                    gap-2.5
                    rounded-md
                    px-2.5
                  "
              >
                <HugeiconsIcon
                  icon={KanbanIcon}
                  size={15}
                  strokeWidth={1.5}
                  className="
                      shrink-0
                      text-(--text-muted)
                    "
                />

                <span
                  className="
                      font-mono
                      text-[12px]
                      text-(--text-muted)
                    "
                >
                  No boards
                </span>
              </div>
            )}

            {/* Boards */}
            {!isLoading && !isError && boards.length > 0 && (
              <div
                className="
                    flex
                    flex-col
                    gap-2
                    overflow-visible
                  "
              >
                {/* Pinned */}
                {pinnedBoards.length > 0 && (
                  <div>
                    <div
                      className="
                          mb-1
                          flex
                          items-center
                          justify-between
                          px-2
                        "
                    >
                      <span
                        className="
                            font-mono
                            text-[9px]
                            font-medium
                            uppercase
                            tracking-[0.14em]
                            text-(--text-muted)
                          "
                      >
                        Pinned
                      </span>
                    </div>

                    <div
                      className="
                          flex
                          flex-col
                          gap-px
                          overflow-visible
                        "
                    >
                      {pinnedBoards.map(renderBoardRow)}
                    </div>
                  </div>
                )}

                {/* Time groups */}
                {timeGroups.map((group) => (
                  <div key={group.label}>
                    <h3
                      className="
                            mb-1
                            px-2
                            font-mono
                            text-[9px]
                            font-medium
                            uppercase
                            tracking-[0.14em]
                            text-(--text-muted)
                          "
                    >
                      {group.label}
                    </h3>

                    <div
                      className="
                            flex
                            flex-col
                            gap-px
                            overflow-visible
                          "
                    >
                      {group.boards.map(renderBoardRow)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Infinite scroll */}
            {!isLoading && !isError && hasNextPage && (
              <div ref={loadMoreRef} className="pt-2">
                {isFetchingNextPage ? (
                  <BoardsSkeleton rows={3} />
                ) : (
                  <LoadingDots />
                )}
              </div>
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
    <div
      className="
        flex
        items-center
        justify-center
        gap-1
        py-3
      "
    >
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="
              h-1
              w-1
              rounded-full
              bg-white/25
            "
          style={{
            animation: `sidebarLoadingDot 1.4s ease-in-out ${
              index * 0.15
            }s infinite`,
          }}
        />
      ))}

      <style>{`
        @keyframes sidebarLoadingDot {
          0%, 100% {
            opacity: 0.3;
            transform: translateY(0);
          }

          50% {
            opacity: 1;
            transform: translateY(-2px);
          }
        }
      `}</style>
    </div>
  );
}

function BoardsSkeleton({ rows }: { rows: number }) {
  return (
    <div
      className="
        flex
        flex-col
        gap-1
        px-2
        py-1
      "
    >
      {Array.from({
        length: rows,
      }).map((_, index) => (
        <div
          key={index}
          className="
              flex
              h-9
              items-center
              gap-2.5
              rounded-md
              px-2.5
            "
        >
          <div
            className="
                size-4
                shrink-0
                animate-pulse
                rounded
                bg-white/15
              "
          />

          <div
            className="
                h-2.5
                animate-pulse
                rounded-full
                bg-white/15
              "
            style={{
              width: `${70 + (index % 4) * 25}px`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
