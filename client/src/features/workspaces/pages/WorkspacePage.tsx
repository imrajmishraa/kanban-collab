import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Edit02Icon,
  File02Icon,
  MoreHorizontalIcon,
  StarIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

import BoardError from "@components/ui/board/BoardError";

import {
  AddMemberDialog,
  CreateBoardDialog,
  EditWorkspaceDialog,
  WorkspaceAvatarDialog,
} from "@/features/workspaces/components/workspace-dialogs";

import {
  BoardMessage,
  BoardShell,
} from "@/features/boards/components/BoardStates";
import { BoardCard } from "@/features/workspaces/components/BoardCard";
import { BoardSearch } from "@/features/workspaces/components/BoardSearch";
import WorkspaceOverview from "@/features/boards/components/WorkspaceOverview";
import { useActiveWorkspaceMembers } from "@/features/boards/hooks/useActiveWorkspaceMembers";
import { useWorkspaceBoards } from "@/features/boards/hooks/useWorkspaceBoards";
import { useWorkspaces } from "@/hooks/dashboard/useWorkspaces";
import { useActiveWorkspace } from "@/stores/activeWorkspace";
import { useStarredWorkspaces } from "@/stores/starredWorkspaces";
import { toastSuccess } from "@/lib/toast";

type Dialog = "board" | "member" | "rename" | "avatar" | null;

/**
 * Workspace page: every board in a single workspace, with its columns, cards
 * and member count. Reachable at `/workspaces/:workspaceId`.
 */
export function WorkspacePage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const { activeWorkspaceId, activeWorkspaceName, setActiveWorkspace } =
    useActiveWorkspace();
  const { workspaces } = useWorkspaces();
  const members = useActiveWorkspaceMembers();

  const [dialog, setDialog] = useState<Dialog>(null);
  const [boardQuery, setBoardQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const starredIds = useStarredWorkspaces((state) => state.ids);
  const toggleStar = useStarredWorkspaces((state) => state.toggle);

  // Keep the active workspace in sync with the URL.
  useEffect(() => {
    if (!workspaceId || workspaceId === activeWorkspaceId) return;
    const match = workspaces.find((workspace) => workspace.id === workspaceId);
    setActiveWorkspace(workspaceId, match?.name ?? "");
  }, [workspaceId, activeWorkspaceId, workspaces, setActiveWorkspace]);

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

  const {
    items,
    totalBoards,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useWorkspaceBoards();

  const query = boardQuery.trim().toLowerCase();
  const visibleItems = query
    ? items.filter((item) => item.board.name.toLowerCase().includes(query))
    : items;

  const columnCount = items.reduce(
    (total, item) => total + (item.details?.columns.length ?? 0),
    0,
  );
  const cardCount = items.reduce(
    (total, item) =>
      total +
      (item.details?.columns.reduce(
        (sum, column) => sum + column.cards.length,
        0,
      ) ?? 0),
    0,
  );

  const workspace = workspaces.find((item) => item.id === workspaceId);
  const avatarUrl = workspace?.avatarUrl ?? null;
  const name = activeWorkspaceName || workspace?.name || "Workspace";
  const isStarred = workspaceId ? starredIds.includes(workspaceId) : false;

  const copyLink = () => {
    const url = `${window.location.origin}/workspaces/${workspaceId}`;
    void navigator.clipboard
      .writeText(url)
      .then(() => toastSuccess("Link copied", url))
      .catch(() => toastSuccess("Link", url));
  };

  if (!workspaceId) {
    return (
      <BoardMessage
        title="No workspace selected"
        body="Pick a workspace to see its boards."
      />
    );
  }

  if (isLoading) {
    return (
      <BoardShell>
        <div className="h-8 w-48 animate-pulse rounded bg-white/6" />
      </BoardShell>
    );
  }

  if (isError) {
    return (
      <BoardShell>
        <BoardError
          message="We couldn't load this workspace's boards. Please try again."
          onRetry={() => void refetch()}
        />
      </BoardShell>
    );
  }

  const menuItem = (label: string, icon: typeof StarIcon, run: () => void) => (
    <button
      type="button"
      onClick={() => {
        setMenuOpen(false);
        run();
      }}
      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11.5px] text-neutral-300 transition-colors duration-150 hover:bg-white/6 hover:text-neutral-100"
    >
      <HugeiconsIcon icon={icon} size={13} strokeWidth={1.6} />
      {label}
    </button>
  );

  return (
    <BoardShell>
      <header className="flex flex-col gap-4 border-b border-orange-50/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-orange-50/20 bg-white/3 text-[15px] font-semibold text-neutral-300">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              name.trim().charAt(0).toUpperCase() || "W"
            )}
          </span>

          <div className="flex min-w-0 flex-col gap-1.5">
            <h1 className="flex items-center gap-2 text-[22px] font-semibold tracking-tight text-neutral-100 sm:text-[26px]">
              <span className="truncate">{name}</span>
              {isStarred && (
                <HugeiconsIcon
                  icon={StarIcon}
                  size={14}
                  strokeWidth={1.8}
                  className="shrink-0 text-orange-100"
                  aria-label="Starred"
                />
              )}
            </h1>

            <p className="max-w-xl text-[12.5px] leading-5 text-neutral-400">
              Every board in this workspace, with its columns, cards and{" "}
              <span className="font-medium capitalize text-orange-100">
                members
              </span>
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setDialog("member")}
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-none rounded-tl-lg rounded-br-lg border border-orange-50/20 px-4 text-[12px] text-neutral-200 transition-colors duration-200 hover:border-orange-50/35 hover:bg-white/4 hover:text-neutral-100"
          >
            <HugeiconsIcon icon={UserGroupIcon} size={13} strokeWidth={1.8} />
            Add member
          </button>

          <button
            type="button"
            onClick={() => setDialog("board")}
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-none rounded-tr-lg rounded-bl-lg bg-white px-4 text-[12px] font-semibold text-black transition-colors duration-200 hover:bg-neutral-200"
          >
            <HugeiconsIcon icon={Add01Icon} size={13} strokeWidth={2} />
            Add board
          </button>

          {/* The same actions as the overview card, plus the avatar. */}
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((previous) => !previous)}
              aria-label="Workspace actions"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className={[
                "flex size-9 cursor-pointer items-center justify-center rounded-none rounded-tl-lg rounded-br-lg border transition-colors duration-200",
                menuOpen
                  ? "border-orange-50/30 bg-white/6 text-neutral-100"
                  : "border-orange-50/20 text-neutral-400 hover:border-orange-50/35 hover:bg-white/4 hover:text-neutral-100",
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
                aria-label="Workspace actions"
                className="absolute right-0 top-full z-30 mt-1 w-48 rounded-lg border border-orange-50/15 bg-[#141416] p-1"
              >
                {menuItem("Edit workspace", Edit02Icon, () =>
                  setDialog("rename"),
                )}
                {menuItem(
                  isStarred ? "Remove star" : "Star workspace",
                  StarIcon,
                  () => toggleStar(workspaceId),
                )}
                {menuItem("Change avatar", File02Icon, () =>
                  setDialog("avatar"),
                )}
                {menuItem("Add member", UserGroupIcon, () =>
                  setDialog("member"),
                )}
                {menuItem("Copy link", File02Icon, copyLink)}
              </div>
            )}
          </div>
        </div>
      </header>

      <WorkspaceOverview
        boardCount={totalBoards || items.length}
        columnCount={columnCount}
        cardCount={cardCount}
        memberCount={members.length}
        isPartial={hasNextPage}
      />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-[13px] font-medium tracking-tight text-neutral-100">
          Boards
          {items.length > 0 && (
            <span className="ml-1.5 font-mono text-[10px] tabular-nums text-neutral-500">
              {visibleItems.length}/{totalBoards || items.length}
            </span>
          )}
        </h2>

        {items.length > 0 && (
          <BoardSearch value={boardQuery} onChange={setBoardQuery} />
        )}
      </div>

      {items.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-orange-50/20 px-5 py-12 text-center">
          <p className="text-[12.5px] text-neutral-400">
            No boards in this workspace yet, create one to get{" "}
            <span className="font-medium capitalize text-orange-100">
              started
            </span>
          </p>
        </div>
      ) : visibleItems.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-orange-50/20 px-5 py-10 text-center">
          <p className="text-[12.5px] text-neutral-400">
            No boards match “{boardQuery.trim()}”
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visibleItems.map((item) => (
            <BoardCard
              key={item.board.id}
              board={item.board}
              details={item.details}
              isLoadingDetails={item.isLoadingDetails}
              onClick={() => navigate(`/boards/${item.board.id}`)}
            />
          ))}
        </div>
      )}

      {hasNextPage && (
        <button
          type="button"
          onClick={fetchNextPage}
          disabled={isFetchingNextPage}
          className="mx-auto mt-6 flex h-9 items-center gap-2 rounded-none rounded-tl-lg rounded-br-lg border border-orange-50/20 px-4 text-[12px] text-neutral-200 transition-colors duration-200 hover:border-orange-50/35 hover:bg-white/4 hover:text-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isFetchingNextPage ? "Loading…" : "Load more boards"}
        </button>
      )}

      {dialog === "board" && (
        <CreateBoardDialog
          workspaceId={workspaceId}
          onClose={() => setDialog(null)}
        />
      )}

      {dialog === "member" && (
        <AddMemberDialog
          workspaceId={workspaceId}
          onClose={() => setDialog(null)}
        />
      )}

      {dialog === "rename" && (
        <EditWorkspaceDialog
          workspaceId={workspaceId}
          currentName={name}
          currentDescription={workspace?.description ?? ""}
          onClose={() => setDialog(null)}
        />
      )}

      {dialog === "avatar" && (
        <WorkspaceAvatarDialog
          workspaceId={workspaceId}
          workspaceName={name}
          currentAvatarUrl={avatarUrl}
          onClose={() => setDialog(null)}
        />
      )}
    </BoardShell>
  );
}
