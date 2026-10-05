import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, KanbanIcon } from "@hugeicons/core-free-icons";

import { useBoardsStore } from "@/stores/boards";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return "—";
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/**
 * Boards menu for the dashboard navbar.
 *
 * Lists boards from the persisted boards store (grabbed + saved by
 * `useSyncSavedBoards`), sorted A–Z — not a live "recently opened" feed.
 */
export function RecentBoardsMenu() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const boards = useBoardsStore((s) => s.boards);
  const setLastBoard = useBoardsStore((s) => s.setLastBoard);

  const sortedBoards = useMemo(
    () => [...boards].sort((a, b) => a.name.localeCompare(b.name)),
    [boards],
  );

  const currentBoardId = location.pathname.startsWith("/board/")
    ? location.pathname.split("/")[2]
    : null;

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
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

  const open = (boardId: string) => {
    setLastBoard(boardId);
    setIsOpen(false);
    navigate(`/boards/${boardId}`);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={[
          "group flex h-7 cursor-pointer items-center gap-1.5",
          "rounded-md px-2",
          "font-mono text-[11px]",
          "transition-colors duration-150",
          isOpen
            ? "bg-white/8 text-(--text-primary)"
            : "text-(--text-secondary) hover:bg-white/6 hover:text-(--text-primary)",
        ].join(" ")}
      >
        <HugeiconsIcon
          icon={KanbanIcon}
          size={14}
          strokeWidth={1.6}
          className={[
            "shrink-0 transition-colors duration-150",
            isOpen
              ? "text-(--brand)"
              : "text-(--text-muted) group-hover:text-(--brand)",
          ].join(" ")}
        />

        <span className="max-w-24 truncate">Boards</span>

        <HugeiconsIcon
          icon={ArrowDown01Icon}
          size={10}
          strokeWidth={1.8}
          className={[
            "shrink-0 text-(--text-muted) transition-transform duration-150",
            isOpen && "rotate-180",
          ].join(" ")}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Boards"
          className={[
            "absolute left-0 top-full z-50 mt-1.5 flex w-54 flex-col overflow-hidden rounded-lg",
            "border border-white/10 bg-(--bg-surface)",
            "shadow-[0_8px_24px_-6px_rgba(0,0,0,0.7)]",
          ].join(" ")}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-white/6 px-3 py-2">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-(--text-muted)">
              Boards
            </p>
            {sortedBoards.length > 0 && (
              <span className="font-mono text-[10px] tabular-nums text-(--text-muted)">
                {sortedBoards.length}
              </span>
            )}
          </div>

          <div className="max-h-[min(360px,calc(100vh-8rem))] min-h-0 flex-1 overflow-y-auto p-1">
            {sortedBoards.length === 0 ? (
              <p className="px-2 py-3 text-center font-mono text-[11px] text-(--text-muted)">
                No boards yet
              </p>
            ) : (
              sortedBoards.map((board) => {
                const isActive = board.id === currentBoardId;

                return (
                  <button
                    key={board.id}
                    type="button"
                    role="menuitem"
                    onClick={() => open(board.id)}
                    className={[
                      "group flex w-full cursor-pointer items-center gap-2",
                      "rounded px-2 py-1.5 text-left font-mono text-[11px]",
                      "transition-colors duration-150",
                      isActive
                        ? "bg-white/5 text-(--text-primary)"
                        : "text-(--text-secondary) hover:bg-white/4 hover:text-(--text-primary)",
                    ].join(" ")}
                  >
                    <HugeiconsIcon
                      icon={KanbanIcon}
                      size={13}
                      strokeWidth={1.5}
                      className={[
                        "shrink-0 transition-colors duration-150",
                        isActive
                          ? "text-(--brand)"
                          : "text-(--text-muted) group-hover:text-(--brand)",
                      ].join(" ")}
                    />

                    <span className="min-w-0 flex-1 truncate">
                      {board.name}
                    </span>

                    <span className="shrink-0 font-mono text-[9px] tabular-nums text-(--text-muted)">
                      {relativeTime(board.updatedAt)}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
