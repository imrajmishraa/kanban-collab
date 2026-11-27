import { useQuery } from "@tanstack/react-query";

import { workspaceApi } from "@/features/workspaces";
import { workspaceKeys } from "@/hooks/useWorkspaces";

import type { Workspace } from "@/types/workspace";

/**
 * A single workspace, including its `status` and deletion dates.
 *
 * Shares `workspaceKeys.detail` with the rest of the workspace queries, so a
 * cancel mutation that invalidates the workspace key refreshes this too.
 */
export function useWorkspace(workspaceId: string | null | undefined) {
  return useQuery<Workspace>({
    queryKey: workspaceKeys.detail(workspaceId ?? ""),
    queryFn: () => workspaceApi.getWorkspace(workspaceId as string),
    enabled: Boolean(workspaceId),
    staleTime: 30_000,
  });
}
