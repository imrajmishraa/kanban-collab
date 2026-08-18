import { useEffect, useState } from "react";

const ACTIVE_WORKSPACE_KEY = "kanban.activeWorkspaceId";

export function useActiveWorkspace(workspaceIds: string[]) {
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<
    string | undefined
  >(() => {
    return localStorage.getItem(ACTIVE_WORKSPACE_KEY) ?? undefined;
  });

  useEffect(() => {
    if (workspaceIds.length === 0) {
      setActiveWorkspaceIdState(undefined);
      return;
    }

    const storedWorkspaceId = localStorage.getItem(ACTIVE_WORKSPACE_KEY);

    /*
     * Keep the persisted workspace if it still exists.
     */
    if (storedWorkspaceId && workspaceIds.includes(storedWorkspaceId)) {
      setActiveWorkspaceIdState(storedWorkspaceId);
      return;
    }

    /*
     * Otherwise select the first available workspace.
     */
    const fallbackWorkspaceId = workspaceIds[0];

    setActiveWorkspaceIdState(fallbackWorkspaceId);

    localStorage.setItem(ACTIVE_WORKSPACE_KEY, fallbackWorkspaceId);
  }, [workspaceIds]);

  const setActiveWorkspaceId = (workspaceId: string) => {
    if (!workspaceIds.includes(workspaceId)) {
      return;
    }

    setActiveWorkspaceIdState(workspaceId);

    localStorage.setItem(ACTIVE_WORKSPACE_KEY, workspaceId);
  };

  return {
    activeWorkspaceId,
    setActiveWorkspaceId,
  };
}
