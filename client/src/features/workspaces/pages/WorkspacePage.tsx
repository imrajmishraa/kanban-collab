import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, UserGroupIcon } from "@hugeicons/core-free-icons";

import BoardError from "@components/ui/board/BoardError";

import {
  AddMemberDialog,
  CreateBoardDialog,
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

/**
 * Workspace page — every board in a single workspace, with its columns,
 * cards and member count. Reachable at `/workspaces/:workspaceId`.
 */
export function WorkspacePage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const { activeWorkspaceId, activeWorkspaceName, setActiveWorkspace } =
    useActiveWorkspace();
  const { workspaces } = useWorkspaces();
  const members = useActiveWorkspaceMembers();

  const [dialog, setDialog] = useState<"board" | "member" | null>(null);
  const [boardQuery, setBoardQuery] = useState("");

  // Keep the active workspace in sync with the URL.
  useEffect(() => {
    if (!workspaceId || workspaceId === activeWorkspaceId) return;
    const match = workspaces.find((workspace) => workspace.id === workspaceId);
    setActiveWorkspace(workspaceId, match?.name ?? "");
  }, [workspaceId, activeWorkspaceId, workspaces, setActiveWorkspace]);

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

  return (
    <BoardShell>
      <header className="flex flex-col gap-4 border-b border-orange-50/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-500">
            Workspace
          </p>
          <h1 className="mt-1 text-[22px] font-semibold tracking-tight text-neutral-100 sm:text-[26px]">
            {activeWorkspaceName || "Workspace"}
          </h1>
          <p className="max-w-xl text-[12.5px] leading-5 text-neutral-400">
            Every board in this workspace, with its columns, cards and{" "}
            <span className="font-medium capitalize text-orange-100">
              members
            </span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Outline: the secondary action. */}
          <button
            type="button"
            onClick={() => setDialog("member")}
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-none rounded-tl-lg rounded-br-lg border border-orange-50/20 px-4 text-[12px] text-neutral-200 transition-colors duration-200 hover:border-orange-50/35 hover:bg-white/4 hover:text-neutral-100"
          >
            <HugeiconsIcon icon={UserGroupIcon} size={13} strokeWidth={1.8} />
            Add member
          </button>

          {/* Solid: the primary action on this page. */}
          <button
            type="button"
            onClick={() => setDialog("board")}
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-none rounded-tr-lg rounded-bl-lg bg-white px-4 text-[12px] font-semibold text-black transition-colors duration-200 hover:bg-neutral-200"
          >
            <HugeiconsIcon icon={Add01Icon} size={13} strokeWidth={2} />
            Add board
          </button>
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
    </BoardShell>
  );
}
