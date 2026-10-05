import { useEffect } from "react";
import { useParams } from "react-router-dom";

import BoardError from "@components/ui/board/BoardError";

import { BoardMessage, BoardShell } from "@/features/boards/components/BoardStates";
import WorkspaceBoardCard from "@/features/boards/components/WorkspaceBoardCard";
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
  const { activeWorkspaceId, activeWorkspaceName, setActiveWorkspace } =
    useActiveWorkspace();
  const { workspaces } = useWorkspaces();
  const members = useActiveWorkspaceMembers();

  // Keep the active workspace in sync with the URL.
  useEffect(() => {
    if (!workspaceId || workspaceId === activeWorkspaceId) return;
    const match = workspaces.find((workspace) => workspace.id === workspaceId);
    setActiveWorkspace(workspaceId, match?.name ?? "");
  }, [
    workspaceId,
    activeWorkspaceId,
    workspaces,
    setActiveWorkspace,
  ]);

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
        <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
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
      <header className="flex flex-col gap-2 border-b border-white/8 pb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-(--text-muted)">
          Workspace
        </p>
        <h1 className="mt-1 font-mono text-[22px] font-semibold tracking-tight text-(--text-primary) sm:text-[26px]">
          {activeWorkspaceName || "Workspace"}
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
