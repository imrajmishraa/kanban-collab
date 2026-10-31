import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ChevronsLeftRightIcon,
  DashboardSquare02Icon,
  KanbanIcon,
  Search01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";

import { useBoards } from "@/hooks/useBoards";

interface BoardSelectorProps {
  activeBoardId: string | null;
  onSelect: (boardId: string) => void;
  triggerClassName?: string;
  dropdownClassName?: string;
}

/**
 * Boards switcher in the navbar, mirroring `WorkspaceSelector`: trigger,
 * filter field, list with the open board ticked, and a footer link.
 *
 * Boards come from the shared `useBoards()` infinite query, so this adds no
 * request of its own. The filter is client-side over the pages already
 * loaded, because the boards endpoint takes no search parameter; scrolling
 * still pulls the next page.
 */
export function BoardSelector({
  activeBoardId,
  onSelect,
  triggerClassName,
  dropdownClassName,
}: BoardSelectorProps) {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useBoards();

  const boards = useMemo(
    () => data?.pages.flatMap((page) => page.boards) ?? [],
    [data],
  );

  const activeBoard = boards.find((board) => board.id === activeBoardId);

  const visible = useMemo(() => {
    const needle = filter.trim().toLowerCase();

    const filtered = needle
      ? boards.filter((board) => board.name.toLowerCase().includes(needle))
      : boards;

    return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }, [boards, filter]);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return;
      setIsOpen(false);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const handleScroll = useCallback(() => {
    const element = listRef.current;
    if (!element || !hasNextPage || isFetchingNextPage) return;

    const nearBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight < 80;

    if (nearBottom) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setFilter("");
          setIsOpen((previous) => !previous);
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={[
          "group flex h-7 cursor-pointer items-center gap-2 rounded-md px-2",
          "text-[11.5px] tracking-tight",
          "transition-colors duration-200",
          isOpen
            ? "bg-(--tint-8) text-(--text-primary)"
            : "text-(--text-soft) hover:bg-(--bg-hover) hover:text-(--text-primary)",
          triggerClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className="max-w-32 truncate">
          {activeBoard?.name ?? "Select board"}
        </span>

        <HugeiconsIcon
          icon={ChevronsLeftRightIcon}
          size={13}
          strokeWidth={1.8}
          className={[
            "shrink-0 text-(--text-muted) rotate-90 transition-transform duration-200",
            isOpen && "",
          ].join(" ")}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Select board"
          className={[
            "absolute left-0 top-full z-50 mt-1.5 flex flex-col overflow-hidden rounded-xl",
            "border border-(--hairline) bg-(--bg-root)",
            "max-h-[min(360px,calc(100vh-8rem))]",
            dropdownClassName ?? "w-72",
          ].join(" ")}
        >
          {/* Filter */}
          <div className="flex shrink-0 items-center gap-2 border-b border-(--hairline) px-3 py-2">
            <HugeiconsIcon
              icon={Search01Icon}
              size={14}
              strokeWidth={1.6}
              className="shrink-0 text-(--text-subtle)"
            />

            <input
              type="text"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Find board"
              autoFocus
              className="
                min-w-0 flex-1 bg-transparent
                text-[12.5px] tracking-tight text-(--text-primary)
                placeholder:text-(--text-subtle)
                outline-hidden ring-0 focus:outline-hidden focus:ring-0
                focus-visible:outline-hidden
              "
            />

            <kbd className="shrink-0 rounded border border-(--hairline) bg-(--tint-6) px-1 py-0.5 font-mono text-[9px] text-(--text-muted)">
              Esc
            </kbd>
          </div>

          {/* List */}
          <div
            ref={listRef}
            onScroll={handleScroll}
            className="min-h-0 flex-1 overflow-y-auto p-1"
          >
            {isError ? (
              <p className="px-2 py-2 text-[12px] text-(--danger)">
                Unable to load boards.
              </p>
            ) : isLoading ? (
              <BoardSkeleton />
            ) : visible.length === 0 ? (
              <p className="px-2 py-3 text-center text-[12px] text-(--text-muted)">
                {filter.trim()
                  ? `No matches for “${filter.trim()}”`
                  : "No boards in this workspace"}
              </p>
            ) : (
              <>
                {visible.map((board) => {
                  const isActive = board.id === activeBoardId;

                  return (
                    <button
                      key={board.id}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => {
                        setIsOpen(false);
                        onSelect(board.id);
                      }}
                      className={[
                        "flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-md px-2",
                        "text-left text-[12.5px] tracking-tight",
                        "transition-colors duration-200",
                        isActive
                          ? "bg-(--tint-7) text-(--text-primary)"
                          : "text-(--text-soft) hover:bg-(--bg-hover) hover:text-(--text-primary)",
                      ].join(" ")}
                    >
                      <HugeiconsIcon
                        icon={DashboardSquare02Icon}
                        size={13}
                        strokeWidth={1.6}
                        className="shrink-0 text-(--text-muted)"
                      />

                      <span className="min-w-0 flex-1 truncate">
                        {board.name}
                      </span>

                      {isActive && (
                        <HugeiconsIcon
                          icon={Tick02Icon}
                          size={13}
                          strokeWidth={2}
                          className="shrink-0 text-(--accent)"
                        />
                      )}
                    </button>
                  );
                })}

                {isFetchingNextPage && (
                  <div className="flex h-8 items-center justify-center">
                    <span className="font-mono text-[9px] text-(--text-subtle)">
                      Loading…
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-(--hairline) p-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate("/boards");
              }}
              className="flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-md px-2 text-left text-[12.5px] tracking-tight text-(--text-soft) transition-colors duration-200 hover:bg-(--bg-hover) hover:text-(--text-primary)"
            >
              <HugeiconsIcon
                icon={KanbanIcon}
                size={14}
                strokeWidth={1.6}
                className="shrink-0 text-(--text-muted)"
              />
              All boards
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function BoardSkeleton() {
  return (
    <div className="space-y-0.5">
      {[1, 2, 3].map((row) => (
        <div
          key={row}
          className="flex h-8 items-center gap-2.5 rounded-md px-2"
        >
          <div className="size-3.5 shrink-0 animate-pulse rounded bg-(--tint-6)" />
          <div
            className={[
              "h-2.5 animate-pulse rounded bg-(--tint-6)",
              row === 1 ? "w-24" : row === 2 ? "w-20" : "w-16",
            ].join(" ")}
          />
        </div>
      ))}
    </div>
  );
}
