import { useInfiniteQuery } from "@tanstack/react-query";

import { workspaceApi } from "@/api/dashboard/workspaceApi";
import type {
  Workspace,
  WorkspacePagination,
} from "@/types/api/dashboard/workspace";

export interface WorkspacesPage {
  workspaces: Workspace[];
  pagination: WorkspacePagination;
}

export function useInfiniteWorkspaces(search: string, limit = 10) {
  return useInfiniteQuery<WorkspacesPage>({
    queryKey: ["workspaces", "infinite", { search, limit }],
    queryFn: ({ pageParam = 1 }) =>
      workspaceApi.listWorkspaces({
        search: search.trim() || undefined,
        page: pageParam as number,
        limit,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined,
  });
}
