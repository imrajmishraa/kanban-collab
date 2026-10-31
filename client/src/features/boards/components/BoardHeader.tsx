import { useEffect, useRef, useState, type ReactNode } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUpRight01Icon,
  Delete02Icon,
  Edit02Icon,
  Link01Icon,
  MoreHorizontalIcon,
  Share08Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";

import { ShareBoardDialog } from "@/components/sidebar/ShareBoardDialog";

import { DeleteBoardDialog, EditBoardDialog } from "@/features/workspaces";

import { ui } from "@/features/boards/board.helpers";
import { usePinnedBoards } from "@/features/dashboard";
import { toastSuccess } from "@/lib/toast";

interface BoardHeaderProps {
  boardId: string;
  name: string;
  description?: string;
  workspaceName?: string;
  presence?: ReactNode;
  onOpenChange?: (open: boolean) => void;
}

type Dialog = "edit" | "share" | "delete" | null;

function IconButton({
  label,
  icon,
  onClick,
  active = false,
}: {
  label: string;
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"];
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={[
        "flex size-9 cursor-pointer items-center justify-center rounded-lg border transition-colors duration-200",
        active
          ? "border-(--hairline-strong) bg-(--tint-6) text-(--accent)"
          : "border-(--hairline) text-(--text-muted) hover:border-(--hairline-strong) hover:bg-(--tint-5) hover:text-(--text-primary)",
      ].join(" ")}
    >
      <HugeiconsIcon icon={icon} size={16} strokeWidth={1.6} />
    </button>
  );
}

export default function BoardHeader({
  boardId,
  name,
  description,
  workspaceName,
  presence,
}: BoardHeaderProps) {
  const [dialog, setDialog] = useState<Dialog>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const isPinned = usePinnedBoards((state) => state.ids.includes(boardId));
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

  const copyLink = () => {
    const url = `${window.location.origin}/boards/${boardId}`;
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
      onClick={() => {
        setMenuOpen(false);
        run();
      }}
      className={[
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11.5px] transition-colors duration-150",
        danger
          ? "text-(--danger) hover:bg-(--tint-4) hover:text-(--danger)"
          : "text-(--text-soft) hover:bg-(--tint-6) hover:text-(--text-primary)",
      ].join(" ")}
    >
      <HugeiconsIcon icon={icon} size={13} strokeWidth={1.6} />
      {label}
    </button>
  );

  return (
    <header className="flex flex-col gap-6 border-b border-(--hairline) pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {workspaceName && (
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-(--text-muted)">
            {workspaceName}
          </p>
        )}

        <h1 className="mt-2 flex items-center gap-2 text-[22px] font-semibold tracking-tight text-(--text-primary) sm:text-[26px]">
          <span className="truncate">{name}</span>
          {isPinned && (
            <HugeiconsIcon
              icon={StarIcon}
              size={14}
              strokeWidth={1.8}
              className="shrink-0 text-(--accent)"
              aria-label="Starred"
            />
          )}
        </h1>

        {description && (
          <p className="mt-2 max-w-xl text-[12.5px] leading-5 text-(--text-secondary)">
            {description}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {presence}

        <IconButton
          label={isPinned ? "Remove star" : "Star board"}
          icon={StarIcon}
          active={isPinned}
          onClick={() => togglePin(boardId)}
        />

        <button
          type="button"
          onClick={() => setDialog("share")}
          className={ui.pill}
        >
          <HugeiconsIcon
            icon={Share08Icon}
            size={14}
            strokeWidth={1.6}
            className="shrink-0 text-(--text-muted)"
          />
          Share
        </button>

        <div ref={menuRef} className="relative">
          <IconButton
            label="Board actions"
            icon={MoreHorizontalIcon}
            onClick={() => setMenuOpen((previous) => !previous)}
          />

          {menuOpen && (
            <div
              role="menu"
              aria-label="Board actions"
              className="absolute right-0 top-full z-30 mt-1 w-44 rounded-lg border border-(--hairline) bg-(--bg-root) p-1"
            >
              {item("Edit board", Edit02Icon, () => setDialog("edit"))}
              {item(isPinned ? "Remove star" : "Star board", StarIcon, () =>
                togglePin(boardId),
              )}
              {item("Share", Share08Icon, () => setDialog("share"))}
              {item("Copy link", Link01Icon, copyLink)}
              {item("Open in new tab", ArrowUpRight01Icon, () =>
                window.open(`/boards/${boardId}`, "_blank"),
              )}
              {item(
                "Delete board",
                Delete02Icon,
                () => setDialog("delete"),
                true,
              )}
            </div>
          )}
        </div>
      </div>

      {dialog === "edit" && (
        <EditBoardDialog
          boardId={boardId}
          currentName={name}
          currentDescription={description}
          onClose={() => setDialog(null)}
        />
      )}

      {dialog === "share" && (
        <ShareBoardDialog
          boardId={boardId}
          boardName={name}
          onClose={() => setDialog(null)}
        />
      )}

      {dialog === "delete" && (
        <DeleteBoardDialog
          boardId={boardId}
          boardName={name}
          onClose={() => setDialog(null)}
        />
      )}
    </header>
  );
}
