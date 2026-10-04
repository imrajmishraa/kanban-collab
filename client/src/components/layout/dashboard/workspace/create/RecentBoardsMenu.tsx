import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, KanbanIcon } from "@hugeicons/core-free-icons";

import { useBoards } from "@/hooks/dashboard/useBoards";

/**
 * Recent boards dropdown for the dashboard navbar.
 *
 * Reuses `useBoards(6)` — the same query key the sidebar uses — so this
 * shares its cache entry and issues no extra request.
 */
const RECENT_LIMIT = 6;

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

export function RecentBoardsMenu() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useBoards(RECENT_LIMIT);

  const recentBoards = useMemo(() => {
    const boards = data?.pages.flatMap((page) => page.boards) ?? [];
    return [...boards]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, RECENT_LIMIT);
  }, [data]);

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

  const go = (path: string) => {
    setIsOpen(false);
    navigate(path);
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
          aria-label="Recent boards"
          className={[
            "absolute left-0 top-full z-50 mt-1.5 flex w-64 flex-col overflow-hidden rounded-lg",
            "border border-white/10 bg-(--bg-surface)",
            "shadow-[0_8px_24px_-6px_rgba(0,0,0,0.7)]",
          ].join(" ")}
        >
          <div className="shrink-0 border-b border-white/6 px-3 py-2">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-(--text-muted)">
              Recent boards
            </p>
          </div>

          <div className="max-h-[min(320px,calc(100vh-8rem))] min-h-0 flex-1 overflow-y-auto p-1">
            {isError ? (
              <p className="px-2 py-2 font-mono text-[11px] text-(--danger)">
                Unable to load boards.
              </p>
            ) : isLoading ? (
              <RecentSkeleton />
            ) : recentBoards.length === 0 ? (
              <p className="px-2 py-3 text-center font-mono text-[11px] text-(--text-muted)">
                No boards yet
              </p>
            ) : (
              recentBoards.map((board) => {
                const isActive = board.id === currentBoardId;

                return (
                  <button
                    key={board.id}
                    type="button"
                    role="menuitem"
                    onClick={() => go(`/board/${board.id}`)}
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

          <button
            type="button"
            onClick={() => go("/boards")}
            className="shrink-0 border-t border-white/6 px-3 py-2 text-left font-mono text-[10px] uppercase tracking-[0.14em] text-(--text-muted) transition-colors duration-150 hover:bg-white/4 hover:text-(--text-primary)"
          >
            All boards
          </button>
        </div>
      )}
    </div>
  );
}

function RecentSkeleton() {
  return (
    <div className="space-y-0.5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex h-7 items-center gap-2 rounded px-2">
          <div className="size-3.5 shrink-0 animate-pulse rounded bg-white/8" />
          <div
            className={[
              "h-2.5 animate-pulse rounded bg-white/8",
              i === 1 ? "w-28" : i === 2 ? "w-24" : i === 3 ? "w-20" : "w-16",
            ].join(" ")}
          />
        </div>
      ))}
    </div>
  );
}
