import { useMemo } from "react";
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

export const workspaceKeys = {
  all: ["workspaces"] as const,
  infinite: (search: string, limit: number) =>
    [...workspaceKeys.all, "infinite", { search, limit }] as const,
  detail: (workspaceId: string) =>
    [...workspaceKeys.all, "detail", workspaceId] as const,
};

export function useInfiniteWorkspaces(search: string, limit = 10) {
  return useInfiniteQuery<WorkspacesPage>({
    queryKey: workspaceKeys.infinite(search, limit),
    queryFn: ({ pageParam }) =>
      workspaceApi.listWorkspaces({
        search: search.trim() || undefined,
        page: pageParam as number | undefined,
        limit,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined,
    // Keeps the previous list visible while a new search resolves,
    // instead of flashing empty.
    placeholderData: (previous) => previous,
  });
}

/**
 * Flat-list consumers. Shares the exact same query key/cache entry as
 * useInfiniteWorkspaces — calling both never causes a second request.
 */
export function useWorkspaces(search = "") {
  const query = useInfiniteWorkspaces(search);

  const workspaces = useMemo(
    () => query.data?.pages.flatMap((page) => page.workspaces) ?? [],
    [query.data],
  );

  return { ...query, workspaces };
}
