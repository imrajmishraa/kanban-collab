import BoardError from "@components/ui/board/BoardError";

import { BoardMessage, BoardShell } from "../components/BoardStates";
import WorkspaceBoardCard from "../components/WorkspaceBoardCard";
import WorkspaceOverview from "../components/WorkspaceOverview";
import { useActiveWorkspaceMembers } from "../hooks/useActiveWorkspaceMembers";
import { useWorkspaceBoards } from "../hooks/useWorkspaceBoards";

import { useActiveWorkspace } from "@/stores/activeWorkspace";

function OverviewSkeleton() {
  return (
    <div className="mt-6 space-y-4">
      {[0, 1].map((row) => (
        <div
          key={row}
          className="rounded-xl border border-white/8 bg-white/4 p-5"
        >
          <div className="h-4 w-48 animate-pulse rounded bg-white/10" />
          <div className="mt-3 h-3 w-72 max-w-full animate-pulse rounded bg-white/6" />
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((cell) => (
              <div
                key={cell}
                className="h-14 animate-pulse rounded-lg bg-white/6"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Board page — an overview of every board in the active workspace,
 * with each board's columns, cards and member count.
 *
 * Individual boards open on the kanban view at `/board/:boardId`.
 */
export function BoardPage() {
  const { activeWorkspaceId } = useActiveWorkspace();
  const members = useActiveWorkspaceMembers();
  const {
    items,
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
        <div className="h-8 w-40 animate-pulse rounded bg-white/10" />
        <OverviewSkeleton />
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
      {/* Header */}
      <header className="flex flex-col gap-2 border-b border-white/8 pb-6">
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-(--text-muted)">
        </div>

        <h1 className="mt-1 font-mono text-[22px] font-semibold tracking-tight text-(--text-primary) sm:text-[26px]">
          Boards
        </h1>

        <p className="max-w-xl font-mono text-[12px] leading-5 text-(--text-secondary)">
          Every board in this workspace, with its columns, cards and members.
        </p>
      </header>

      <WorkspaceOverview
        boardCount={items.length}
        columnCount={columnCount}
        cardCount={cardCount}
        memberCount={members.length}
      />

      {items.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-white/10 bg-white/2 px-5 py-12 text-center">
          <p className="font-mono text-[12px] text-(--text-muted)">
            No boards in this workspace yet.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <WorkspaceBoardCard
              key={item.board.id}
              board={item.board}
              details={item.details}
              isLoadingDetails={item.isLoadingDetails}
              memberCount={members.length}
            />
          ))}

          {hasNextPage && (
            <button
              type="button"
              onClick={fetchNextPage}
              disabled={isFetchingNextPage}
              className="mx-auto flex h-9 items-center gap-2 rounded-full border border-white/8 bg-white/6 px-4 font-mono text-[12px] text-(--text-primary) transition-colors duration-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isFetchingNextPage ? "Loading…" : "Load more boards"}
            </button>
          )}
        </div>
      )}
    </BoardShell>
  );
}
