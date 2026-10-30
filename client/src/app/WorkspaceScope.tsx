import { useEffect, useRef } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";

import { useWorkspaces } from "@/hooks/dashboard/useWorkspaces";
import { useActiveWorkspace } from "@/stores/activeWorkspace";


export function WorkspaceScope() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { activeWorkspaceId, setActiveWorkspace } = useActiveWorkspace();
  const { workspaces, isLoading } = useWorkspaces();

  const known = workspaceId
    ? workspaces.find((workspace) => workspace.id === workspaceId)
    : undefined;

  /* The id this scope last synced, so a re-render cannot loop. */
  const syncedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!workspaceId || !known) return;
    if (syncedFor.current === workspaceId) return;

    syncedFor.current = workspaceId;
    if (activeWorkspaceId !== workspaceId) {
      setActiveWorkspace(known.id, known.name);
    }
  }, [workspaceId, known, activeWorkspaceId, setActiveWorkspace]);

  if (!workspaceId) return <Navigate to="/workspaces" replace />;

  /* Only after the list has loaded, and only when it actually has entries:
     an empty first page is not proof that the workspace is gone. */
  if (!isLoading && workspaces.length > 0 && !known) {
    return <Navigate to="/workspaces" replace />;
  }

  return <Outlet />;
}
