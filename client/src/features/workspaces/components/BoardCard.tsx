import { useEffect, useRef, useState } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUpRight01Icon,
  Delete02Icon,
  Edit02Icon,
  KanbanIcon,
  Link01Icon,
  MoreHorizontalIcon,
  Share08Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";

import {
  DeleteBoardDialog,
  EditBoardDialog,
} from "@/features/workspaces/components/board-dialogs";
import { ShareBoardDialog } from "@/components/layout/dashboard/sidebar/ShareBoardDialog";

import { usePinnedBoards } from "@/stores/pinnedBoards";
import { toastSuccess } from "@/lib/toast";

import type { Board, BoardDetails } from "@/types/api/dashboard/board";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();

  if (Number.isNaN(diff)) return "";

  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

type BoardDialog = "edit" | "share" | "delete" | null;

interface BoardCardProps {
  board: Board;
  details?: BoardDetails;
  isLoadingDetails?: boolean;
  onClick: () => void;
}

/**
 * One board, compact. The whole card opens the board; the glyph on the left
 * turns into a menu button on hover, which is where rename, star, share and
 * delete live.
 */
export function BoardCard({
  board,
  details,
  isLoadingDetails = false,
  onClick,
}: BoardCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialog, setDialog] = useState<BoardDialog>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  const isPinned = usePinnedBoards((state) => state.ids.includes(board.id));
  const togglePin = usePinnedBoards((state) => state.toggle);

  useEffect(() => {
    if (!menuOpen) return;

    const onDown = (event: PointerEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return;
      setMenuOpen(false);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const columnCount = details?.columns.length ?? 0;
  const cardCount =
    details?.columns.reduce(
      (total, column) => total + column.cards.length,
      0,
    ) ?? 0;

  const copyLink = () => {
    const url = `${window.location.origin}/boards/${board.id}`;
    void navigator.clipboard
      .writeText(url)
      .then(() => toastSuccess("Link copied", url))
      .catch(() => toastSuccess("Link", url));
  };

  const item = (
    label: string,
    icon: typeof StarIcon,
    run: () => void,
    danger = false,
  ) => (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        setMenuOpen(false);
        run();
      }}
      className={[
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11.5px] transition-colors duration-150",
        danger
          ? "text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
          : "text-neutral-300 hover:bg-white/6 hover:text-neutral-100",
      ].join(" ")}
    >
      <HugeiconsIcon icon={icon} size={13} strokeWidth={1.6} />
      {label}
    </button>
  );

  return (
    <div className="group/board relative">
      <button
        type="button"
        onClick={onClick}
        className="
          flex w-full cursor-pointer flex-col rounded-xl
          border border-orange-50/6 bg-[#0a0a0a]/50
          px-4 py-3.5 text-left
          transition-colors duration-300 ease-out
          hover:border-orange-50/20 hover:bg-white/3
        "
      >
        <div className="flex items-start gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-orange-50/15 text-neutral-500 transition-opacity duration-200 group-hover/board:opacity-0">
            <HugeiconsIcon icon={KanbanIcon} size={14} strokeWidth={1.7} />
          </span>

          <div className="min-w-0 flex-1">
            <h3 className="flex items-center gap-1.5 text-[13.5px] font-medium tracking-tight text-neutral-100">
              <span className="truncate">{board.name}</span>
              {isPinned && (
                <HugeiconsIcon
                  icon={StarIcon}
                  size={11}
                  strokeWidth={1.8}
                  className="shrink-0 text-orange-100"
                  aria-label="Starred"
                />
              )}
            </h3>

            <p className="mt-0.5 truncate text-[12px] text-neutral-500">
              {board.description?.trim() || "No description"}
            </p>
          </div>

          <HugeiconsIcon
            icon={ArrowUpRight01Icon}
            size={14}
            strokeWidth={1.8}
            className="mt-0.5 shrink-0 text-neutral-600 transition-colors duration-200 group-hover/board:text-orange-100"
          />
        </div>

        <div className="mt-3 flex items-center gap-2 pl-11 text-[11px] text-neutral-500">
          {isLoadingDetails ? (
            <span className="h-2.5 w-24 animate-pulse rounded bg-white/6" />
          ) : (
            <>
              <span className="tabular-nums">{columnCount}</span>
              <span>{columnCount === 1 ? "column" : "columns"}</span>
              <span aria-hidden="true" className="text-neutral-700">
                /
              </span>
              <span className="tabular-nums text-orange-100">{cardCount}</span>
              <span>{cardCount === 1 ? "card" : "cards"}</span>
            </>
          )}

          <span className="ml-auto shrink-0 font-mono text-[9px] uppercase tracking-wider text-neutral-600">
            {relativeTime(board.updatedAt)}
          </span>
        </div>
      </button>

      {/* Sits exactly where the glyph is: the glyph fades, this appears. */}
      <div ref={menuRef} className="absolute left-4 top-3.5">
        <button
          type="button"
          aria-label="Board actions"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={(event) => {
            event.stopPropagation();
            setMenuOpen((previous) => !previous);
          }}
          className={[
            "flex size-8 cursor-pointer items-center justify-center rounded-lg border transition-all duration-200",
            "opacity-0 focus-visible:opacity-100 group-hover/board:opacity-100",
            menuOpen
              ? "border-orange-50/25 bg-white/8 text-neutral-100 opacity-100"
              : "border-orange-50/15 text-neutral-400 hover:border-orange-50/25 hover:bg-white/6 hover:text-neutral-100",
          ].join(" ")}
        >
          <HugeiconsIcon
            icon={MoreHorizontalIcon}
            size={15}
            strokeWidth={1.8}
          />
        </button>

        {menuOpen && (
          <div
            role="menu"
            aria-label="Board actions"
            className="absolute left-0 top-full z-30 mt-1 w-44 rounded-lg border border-orange-50/15 bg-[#141416] p-1"
          >
            {item("Open board", ArrowUpRight01Icon, onClick)}
            {item("Edit board", Edit02Icon, () => setDialog("edit"))}
            {item(isPinned ? "Remove star" : "Star board", StarIcon, () =>
              togglePin(board.id),
            )}
            {item("Share", Share08Icon, () => setDialog("share"))}
            {item("Copy link", Link01Icon, copyLink)}
            {item(
              "Delete board",
              Delete02Icon,
              () => setDialog("delete"),
              true,
            )}
          </div>
        )}
      </div>

      {dialog === "edit" && (
        <EditBoardDialog
          boardId={board.id}
          currentName={board.name}
          currentDescription={board.description}
          onClose={() => setDialog(null)}
        />
      )}

      {dialog === "share" && (
        <ShareBoardDialog
          boardId={board.id}
          boardName={board.name}
          onClose={() => setDialog(null)}
        />
      )}

      {dialog === "delete" && (
        <DeleteBoardDialog
          boardId={board.id}
          boardName={board.name}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}
