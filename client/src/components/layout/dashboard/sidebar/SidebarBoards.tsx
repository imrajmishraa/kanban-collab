import { useEffect, useRef } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  KanbanIcon,
} from "@hugeicons/core-free-icons";

import SidebarItem from "@components/ui/dashboard/SidebarItem";

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
}: SidebarBoardsProps) => {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target || !open || !hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          onLoadMore();
        }
      },
      {
        rootMargin: "120px",
        threshold: 0,
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [open, hasNextPage, isFetchingNextPage, onLoadMore]);

  if (collapsed) {
    return null;
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col px-3 pt-6">
      {/* Boards Header */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="
          mb-2 flex w-full shrink-0 cursor-pointer
          items-center justify-between
          rounded-md
          border border-transparent
          px-2 py-1.5
          transition-all duration-150
          hover:border-(--brand)
          hover:bg-(--brand-muted)
        "
      >
        <span
          className="
            font-mono text-[10px] font-semibold
            tracking-[0.2em]
            text-(--text-muted)
          "
        >
          Boards
        </span>

        <HugeiconsIcon
          icon={open ? ArrowDown01Icon : ArrowRight01Icon}
          size={14}
          strokeWidth={1.5}
          className="
            text-(--text-muted)
            transition-colors duration-150
            group-hover:text-(--text-primary)
          "
        />
      </button>

      {/* Boards List */}
      {open && (
        <div
          className="
            sidebar-board-scroll
            min-h-0 flex-1
            space-y-0.5
            overflow-y-auto
            pr-1
          "
        >
          {/* Initial Loading */}
          {isLoading ? (
            <div className="space-y-1.5 px-2 py-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex h-8 items-center gap-3">
                  <div
                    className="
                      size-4 shrink-0
                      animate-pulse rounded-sm
                      bg-(--border-strong)
                    "
                  />

                  <div
                    className="
                      h-3 animate-pulse rounded-sm
                      bg-(--border-strong)
                    "
                    style={{
                      width: `${60 + (index % 3) * 20}px`,
                    }}
                  />
                </div>
              ))}
            </div>
          ) : isError ? (
            /* Error */
            <div
              className="
                px-2 py-2
                font-mono text-[11px]
                text-(--danger)
              "
            >
              Unable to load boards.
            </div>
          ) : boards.length === 0 ? (
            /* Empty */
            <div
              className="
                px-2 py-2
                font-mono text-[11px]
                text-(--text-muted)
              "
            >
              No boards
            </div>
          ) : (
            <>
              {/* Board Items */}
              {boards.map((board) => (
                <SidebarItem
                  key={board.id}
                  label={board.name}
                  href={`/board/${board.id}`}
                  icon={
                    <HugeiconsIcon
                      icon={KanbanIcon}
                      size={16}
                      strokeWidth={1.5}
                    />
                  }
                  collapsed={false}
                />
              ))}

              {/* Infinite Scroll Sentinel */}
              <div
                ref={loadMoreRef}
                className="
                  flex min-h-10
                  items-center justify-center
                "
              >
                {isFetchingNextPage && (
                  <div className="w-full space-y-1.5 px-2 py-2">
                    {/* Skeleton row 1 */}
                    <div className="flex h-8 items-center gap-3">
                      <div
                        className="
                          size-4 shrink-0
                          animate-pulse rounded-sm
                          bg-(--border-strong)
                        "
                      />

                      <div
                        className="
                          h-3 w-24
                          animate-pulse rounded-sm
                          bg-(--border-strong)
                        "
                      />
                    </div>

                    {/* Skeleton row 2 */}
                    <div className="flex h-8 items-center gap-3">
                      <div
                        className="
                          size-4 shrink-0
                          animate-pulse rounded-sm
                          bg-(--border-strong)
                        "
                      />

                      <div
                        className="
                          h-3 w-32
                          animate-pulse rounded-sm
                          bg-(--border-strong)
                        "
                      />
                    </div>

                    {/* Skeleton row 3 */}
                    <div className="flex h-8 items-center gap-3">
                      <div
                        className="
                          size-4 shrink-0
                          animate-pulse rounded-sm
                          bg-(--border-strong)
                        "
                      />

                      <div
                        className="
                          h-3 w-20
                          animate-pulse rounded-sm
                          bg-(--border-strong)
                        "
                      />
                    </div>

                    <p
                      className="
                        pt-1 text-center
                        font-mono text-[10px]
                        text-(--text-muted)
                      "
                    >
                      Loading more boards...
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
};

export default SidebarBoards;
