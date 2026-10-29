import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";

import BoardError from "@components/ui/board/BoardError";

import { BoardMessage, BoardShell } from "../components/BoardStates";
import WorkspaceOverview from "../components/WorkspaceOverview";
import { useActiveWorkspaceMembers } from "../hooks/useActiveWorkspaceMembers";
import { useWorkspaceBoards } from "../hooks/useWorkspaceBoards";

import { BoardCard } from "@/features/workspaces/components/BoardCard";
import { BoardSearch } from "@/features/workspaces/components/BoardSearch";
import { CreateBoardDialog } from "@/features/workspaces/components/workspace-dialogs";
import { useActiveWorkspace } from "@/stores/activeWorkspace";

function BoardsSkeleton() {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2, 3, 4, 5].map((cell) => (
        <div
          key={cell}
          className="h-23 animate-pulse rounded-xl border border-orange-50/15 bg-white/3"
        />
      ))}
    </div>
  );
}

/**
 * Boards page: every board in the active workspace.
 *
 * Same shape as the workspace page, since they show the same thing: a stat
 * strip, a filter, and a grid of compact cards. Each card opens the kanban
 * view at `/boards/:boardId`.
 */
export function BoardPage() {
  const navigate = useNavigate();

  const { activeWorkspaceId, activeWorkspaceName } = useActiveWorkspace();
  const members = useActiveWorkspaceMembers();

  const [creating, setCreating] = useState(false);

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

  if (!activeWorkspaceId) {
    return (
      <BoardMessage
        title="No workspace selected"
        body="Pick a workspace to see all of its boards here."
      />
    );
  }

  if (isLoading) {
    return (
      <BoardShell>
        <div className="h-8 w-40 animate-pulse rounded bg-white/6" />
        <BoardsSkeleton />
      </BoardShell>
    );
  }

  if (isError) {
    return (
      <BoardShell>
        <BoardError
          message="We couldn't load the boards in this workspace. Please try again."
          onRetry={() => void refetch()}
        />
      </BoardShell>
    );
  }

  return (
    <BoardShell>
      <header className="flex flex-col gap-4 border-b border-orange-50/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-500">
            {activeWorkspaceName || "Workspace"}
          </p>

          <h1 className="text-[22px] font-semibold tracking-tight text-neutral-100 sm:text-[26px]">
            Boards
          </h1>

          <p className="max-w-xl text-[12.5px] leading-5 text-neutral-400">
            Every board in this workspace, with its columns, cards and{" "}
            <span className="font-medium capitalize text-orange-100">
              members
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-none rounded-tr-lg rounded-bl-lg bg-white px-4 text-[12px] font-semibold text-black transition-colors duration-200 hover:bg-neutral-200"
        >
          <HugeiconsIcon icon={Add01Icon} size={13} strokeWidth={2} />
          Add board
        </button>
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
          All boards
          {items.length > 0 && (
            <span className="ml-1.5 font-mono text-[10px] tabular-nums text-neutral-500">
              {totalBoards || items.length}
            </span>
          )}
        </h2>

        {items.length > 0 && <BoardSearch />}
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
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
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

      {creating && (
        <CreateBoardDialog
          workspaceId={activeWorkspaceId}
          onClose={() => setCreating(false)}
        />
      )}
    </BoardShell>
  );
}
