import { useInfiniteQuery } from "@tanstack/react-query";

import { activityApi } from "@/features/activity/api/activityApi";

import { activityKeys } from "./useBoardActivity";

export const ACTIVITY_PAGE_SIZE = 6;

/**
 * The dashboard activity feed: six rows a page, cursor paginated.
 *
 * Kept separate from `useBoardActivity`, which fetches a fixed slice for one
 * board's side panel.
 */
export function useActivityFeed() {
  return useInfiniteQuery({
    queryKey: [...activityKeys.all, "feed"],
    queryFn: ({ pageParam }) =>
      activityApi.listMyActivity({
        cursor: pageParam as string | null,
        limit: ACTIVITY_PAGE_SIZE,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    // The feed is a background read; a minute of staleness is fine and stops
    // it refetching every time the dashboard remounts.
    staleTime: 60_000,
  });
}
