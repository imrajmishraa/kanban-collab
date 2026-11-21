import { useQuery } from "@tanstack/react-query";

import { notificationKeys, notificationsApi } from "@/features/dashboard";

/**
 * The inbox, fetched on a timer.
 *
 * Notifications arrive from somewhere else — a cron, another user's action, the
 * overdue sweep — and there is no push channel to the client: the WebSocket
 * carries board documents, not inbox rows. So the badge and the list are polled.
 *
 * Until now both shells declared the query themselves with `staleTime: 60_000`
 * and no `refetchInterval` at all, under a comment that called it a "lightweight
 * poll". It was not a poll: the badge and the list only refreshed when something
 * else invalidated the key, which is why a new notification sat invisible until
 * the page was reloaded.
 *
 * One hook, so the two shells cannot drift again:
 *
 * - `refetchInterval` keeps the badge current without a reload.
 * - The list asks for a shorter interval while the panel is open, so a
 *   notification that arrives *while you are looking at the inbox* appears
 *   within a few seconds rather than a minute.
 * - `refetchOnMount: "always"` makes opening the panel fetch immediately instead
 *   of trusting whatever was cached, which is what "it should show up when I open
 *   it" actually means.
 */
export function useNotifications({
  intervalMs = 20_000,
}: { intervalMs?: number } = {}) {
  return useQuery({
    queryKey: notificationKeys.all,
    queryFn: () => notificationsApi.listNotifications(),
    staleTime: 10_000,
    refetchInterval: intervalMs,
    /* A hidden tab does not need to poll; the refetch on focus covers coming
       back to it. */
    refetchIntervalInBackground: false,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}
