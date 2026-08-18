import { useQuery } from "@tanstack/react-query";

import { workspaceApi } from "@/api/dashboard/workspaceApi";

export const workspaceKeys = {
  all: ["workspaces"] as const,

  lists: () => [...workspaceKeys.all, "list"] as const,

  list: () => [...workspaceKeys.lists()] as const,

  detail: (workspaceId: string) =>
    [...workspaceKeys.all, "detail", workspaceId] as const,
};

export function useWorkspaces() {
  return useQuery({
    queryKey: workspaceKeys.list(),
    queryFn: workspaceApi.listWorkspaces,
  });
}
