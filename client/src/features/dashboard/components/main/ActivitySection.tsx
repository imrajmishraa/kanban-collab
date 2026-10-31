import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Loading03Icon,
  Message01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";

import { Avatar } from "@/components/board/BoardAvatar";

import { avatarColor } from "@/features/boards/board.helpers";
import { useActivityFeed } from "@/hooks/useActivityFeed";

/** How many rows fit before the list starts scrolling. */
const VISIBLE_ROWS = 6;

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();

  if (Number.isNaN(diff)) return "--";

  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function ActivitySkeleton() {
  return (
    <ul className="divide-y divide-(--hairline)">
      {Array.from({ length: VISIBLE_ROWS }).map((_, index) => (
        <li key={index} className="flex gap-3 px-4 py-3.5">
          <div className="size-7 shrink-0 animate-pulse rounded-full bg-(--tint-6)" />

          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-2.5 w-24 animate-pulse rounded bg-(--tint-6)" />
            <div className="h-2.5 w-full animate-pulse rounded bg-(--tint-4)" />
            <div className="h-2 w-16 animate-pulse rounded bg-(--tint-3)" />
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * Activity feed.
 *
 * Fixed height with the scroll inside it, so the dashboard layout never jumps
 * as rows arrive. Six rows a page, and the next page loads when the sentinel at
 * the bottom scrolls into view. A refresh button refetches from the top, which
 * is how a just-posted comment shows up without reloading the page.
 */
export default function ActivitySection() {
  const navigate = useNavigate();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    isError,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useActivityFeed();

  const items = data?.pages.flatMap((page) => page.activity) ?? [];

  /* Infinite scroll: one observer on the sentinel, re-armed whenever the list
     grows, rather than a scroll handler that fires on every pixel. */
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "80px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, items.length]);

  return (
    <section className="overflow-hidden rounded-xl border border-(--hairline) bg-(--tint-3)">
      <header className="flex items-center justify-between border-b border-(--hairline) px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md border border-(--hairline) text-(--text-muted)">
            <HugeiconsIcon icon={Message01Icon} size={12} strokeWidth={1.7} />
          </span>

          <p className="text-[12.5px] font-medium tracking-tight text-(--text-primary)">
            Recent activity
          </p>
        </div>

        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          aria-label="Refresh activity"
          className="flex size-6 cursor-pointer items-center justify-center rounded-md text-(--text-muted) transition-colors duration-200 hover:bg-(--bg-hover) hover:text-(--text-primary) disabled:cursor-not-allowed disabled:opacity-50"
        >
          <HugeiconsIcon
            icon={RefreshIcon}
            size={12}
            strokeWidth={1.8}
            className={
              isFetching && !isFetchingNextPage ? "animate-spin" : undefined
            }
          />
        </button>
      </header>

      {/* Fixed height: the list scrolls, the panel does not grow. */}
      <div className="h-105 overflow-y-auto overscroll-contain scroll-smooth">
        {isLoading ? (
          <ActivitySkeleton />
        ) : isError ? (
          <p className="px-4 py-16 text-center text-[12px] text-(--danger)">
            Could not load activity
          </p>
        ) : items.length === 0 ? (
          <p className="px-4 py-16 text-center text-[12px] text-(--text-muted)">
            Nothing here yet
          </p>
        ) : (
          <ul className="divide-y divide-(--hairline)">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/boards/${item.boardId}`)}
                  className="flex w-full cursor-pointer gap-3 px-4 py-3.5 text-left transition-colors duration-200 hover:bg-(--tint-4)"
                >
                  <span className="mt-0.5 shrink-0">
                    <Avatar
                      member={{
                        id: item.userId,
                        name: item.actorName,
                        avatarUrl: item.actorAvatarUrl,
                        color: avatarColor(item.userId),
                      }}
                      size={28}
                      ring={false}
                    />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="min-w-0 truncate text-[12px] font-medium tracking-tight text-(--text-primary)">
                        {item.actorName}
                      </p>

                      <time
                        dateTime={item.createdAt}
                        className="shrink-0 font-mono text-[9px] tabular-nums text-(--text-subtle)"
                      >
                        {relativeTime(item.createdAt)}
                      </time>
                    </div>

                    <p className="mt-1 line-clamp-2 text-[11.5px] leading-5 text-(--text-secondary)">
                      {item.message}
                    </p>

                    {(item.workspaceName || item.boardName) && (
                      <p className="mt-1.5 truncate font-mono text-[9px] uppercase tracking-wider text-(--text-subtle)">
                        {[item.workspaceName, item.boardName]
                          .filter(Boolean)
                          .join(" / ")}
                      </p>
                    )}
                  </div>

                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    size={12}
                    strokeWidth={2}
                    className="mt-1 shrink-0 text-(--text-subtle)"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Sentinel for the next page. */}
        <div ref={sentinelRef} className="h-px" />

        {isFetchingNextPage && (
          <div className="flex items-center justify-center gap-2 py-3 text-[11px] text-(--text-muted)">
            <HugeiconsIcon
              icon={Loading03Icon}
              size={12}
              strokeWidth={2}
              className="animate-spin"
            />
            Loading more
          </div>
        )}

        {!hasNextPage && items.length > 0 && (
          <p className="py-3 text-center text-[10px] uppercase tracking-wider text-(--text-subtle)">
            End of activity
          </p>
        )}
      </div>
    </section>
  );
}
