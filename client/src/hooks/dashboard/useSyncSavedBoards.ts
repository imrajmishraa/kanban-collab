import { useEffect } from "react";

import { useBoards } from "@/hooks/dashboard/useBoards";
import { useActiveWorkspace } from "@/stores/activeWorkspace";
import { useBoardsStore } from "@/stores/boards";

/**
 * Grabs the active workspace's boards and keeps them in the persisted
 * boards store. As the user moves between workspaces, their boards
 * accumulate into one flat list the navbar can list instantly.
 *
 * Mounted once in AppLayout.
 */
export function useSyncSavedBoards() {
  const { activeWorkspaceId, activeWorkspaceName } = useActiveWorkspace();
  const { data } = useBoards();
  const upsertBoards = useBoardsStore((s) => s.upsertBoards);

  useEffect(() => {
    if (!activeWorkspaceId || !data) return;

    const boards = data.pages
      .flatMap((page) => page.boards)
      .map((board) => ({
        id: board.id,
        name: board.name,
        workspaceId: board.workspaceId,
        workspaceName: activeWorkspaceName ?? "",
        updatedAt: board.updatedAt,
      }));

    if (boards.length > 0) upsertBoards(boards);
  }, [activeWorkspaceId, activeWorkspaceName, data, upsertBoards]);
}
