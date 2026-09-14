import { useQuery } from "@tanstack/react-query";

import { workspaceApi } from "@/api/dashboard/workspaceApi";
import type { Workspace } from "@/types/api/dashboard/workspace";

export const workspaceKeys = {
  all: ["workspaces"] as const,
  lists: () => [...workspaceKeys.all, "list"] as const,
  list: () => [...workspaceKeys.lists()] as const,
  detail: (workspaceId: string) =>
    [...workspaceKeys.all, "detail", workspaceId] as const,
};

export function useWorkspaces() {
  return useQuery<Workspace[]>({
    queryKey: workspaceKeys.list(),
    queryFn: async () => {
      const { workspaces } = await workspaceApi.listWorkspaces({ limit: 20 });
      return workspaces;
    },
  });
}
