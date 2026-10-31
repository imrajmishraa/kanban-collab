import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Loading03Icon,
  RefreshIcon,
  Time04Icon,
} from "@hugeicons/core-free-icons";

import { BoardShell } from "@/features/boards";
import BoardError from "@/components/board/BoardError";
import { Avatar } from "@/components/board/BoardAvatar";

import { avatarColor } from "@/features/boards";
import { useActivityFeed } from "@/hooks/useActivityFeed";
import { useActiveWorkspace } from "@/stores/activeWorkspace";

import type { ActivityActionType } from "@/types/activity";

const FILTERS = ["All", "Cards", "Comments", "Boards"] as const;
type Filter = (typeof FILTERS)[number];

/** `?type=comments` and friends, from the sidebar's Activity panel. */
function filterFromParam(value: string | null): Filter {
  const match = FILTERS.find(
    (option) => option.toLowerCase() === (value ?? "").toLowerCase(),
  );

  return match ?? "All";
}

const FILTER_TYPES: Record<Exclude<Filter, "All">, ActivityActionType[]> = {
  Cards: [
    "CARD_CREATE",
    "CARD_UPDATE",
    "CARD_MOVE",
    "CARD_DELETE",
    "CARD_ASSIGN",
    "CARD_UNASSIGN",
    "CARD_ARCHIVE",
  ],
  Comments: ["COMMENT_ADD", "COMMENT_DELETE"],
  Boards: ["BOARD_CREATE", "BOARD_UPDATE", "BOARD_DELETE"],
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();

  if (Number.isNaN(diff)) return "";

  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

/** Day bucket label, so long feeds read as a log rather than a wall. */
function dayLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today)) return "Today";
  if (sameDay(date, yesterday)) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function LogsSkeleton() {
  return (
    <div className="divide-y divide-(--hairline)">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="flex gap-3 px-4 py-3.5">
          <div className="size-7 shrink-0 animate-pulse rounded-full bg-(--tint-6)" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-2.5 w-28 animate-pulse rounded bg-(--tint-6)" />
            <div className="h-2.5 w-full animate-pulse rounded bg-(--tint-4)" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Activity logs: the same feed the dashboard panel shows, at full page width
 * and with a filter. Reads `GET /activity`, which is cursor paginated.
 */
export default function ActivityLogsPage() {
  const navigate = useNavigate();
  const { activeWorkspaceName } = useActiveWorkspace();

  const [searchParams, setSearchParams] = useSearchParams();
  const filter = filterFromParam(searchParams.get("type"));
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

  const all = data?.pages.flatMap((page) => page.activity) ?? [];

  const entries =
    filter === "All"
      ? all
      : all.filter((entry) => FILTER_TYPES[filter].includes(entry.actionType));

  /*
   * Day headers are derived, not accumulated.
   *
   * This used to keep a `let lastDay` and reassign it inside the map, which the
   * React Compiler rejects: mutating during render makes a second render see a
   * different value. Comparing each entry with the one above it gives the same
   * output and stays pure.
   */
  const rows = entries.map((entry, index) => {
    const day = dayLabel(entry.createdAt);
    const previousDay =
      index > 0 ? dayLabel(entries[index - 1]!.createdAt) : null;

    return { entry, day, showDay: day !== previousDay };
  });

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (records) => {
        if (records[0]?.isIntersecting && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "120px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, entries.length]);

  return (
    <BoardShell>
      <header className="flex flex-col gap-4 border-b border-(--hairline) pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-(--text-muted)">
            {activeWorkspaceName || "Workspace"}
          </p>

          <h1 className="text-[22px] font-semibold tracking-tight text-(--text-primary) sm:text-[26px]">
            Activity logs
          </h1>

          <p className="max-w-xl text-[12.5px] leading-5 text-(--text-secondary)">
            Everything that happened across your workspaces, newest{" "}
            <span className="font-medium text-(--accent)">first</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-(--hairline) bg-(--tint-3) p-1">
            {FILTERS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() =>
                  setSearchParams(
                    option === "All" ? {} : { type: option.toLowerCase() },
                    { replace: true },
                  )
                }
                aria-pressed={filter === option}
                className={[
                  "h-7 cursor-pointer rounded-md px-2.5 text-[11.5px] transition-colors duration-200",
                  filter === option
                    ? "bg-(--tint-8) text-(--accent)"
                    : "text-(--text-muted) hover:bg-(--bg-hover) hover:text-(--text-primary)",
                ].join(" ")}
              >
                {option}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            aria-label="Refresh activity"
            className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-(--hairline) text-(--text-secondary) transition-colors duration-200 hover:border-(--hairline-strong) hover:text-(--text-primary) disabled:cursor-not-allowed disabled:opacity-50"
          >
            <HugeiconsIcon
              icon={RefreshIcon}
              size={14}
              strokeWidth={1.8}
              className={
                isFetching && !isFetchingNextPage ? "animate-spin" : undefined
              }
            />
          </button>
        </div>
      </header>

      <section className="mt-6 overflow-hidden rounded-xl border border-(--hairline) bg-(--tint-3)">
        {isLoading ? (
          <LogsSkeleton />
        ) : isError ? (
          <div className="p-6">
            <BoardError
              message="We couldn't load activity right now."
              onRetry={() => void refetch()}
            />
          </div>
        ) : entries.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <span className="mx-auto flex size-9 items-center justify-center rounded-lg border border-(--hairline) text-(--text-subtle)">
              <HugeiconsIcon icon={Time04Icon} size={16} strokeWidth={1.6} />
            </span>

            <p className="mt-3 text-[12.5px] text-(--text-secondary)">
              {filter === "All"
                ? "Nothing has happened yet"
                : `No ${filter.toLowerCase()} activity yet`}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-(--hairline)">
            {rows.map(({ entry, day, showDay }) => (
              <li key={entry.id}>
                {showDay && (
                  <p className="border-b border-(--hairline) bg-(--tint-2) px-4 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-(--text-muted)">
                    {day}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => navigate(`/boards/${entry.boardId}`)}
                  className="flex w-full cursor-pointer items-start gap-3 px-4 py-3.5 text-left transition-colors duration-200 hover:bg-(--tint-4)"
                >
                  <span className="mt-0.5 shrink-0">
                    <Avatar
                      member={{
                        id: entry.userId,
                        name: entry.actorName,
                        avatarUrl: entry.actorAvatarUrl,
                        color: avatarColor(entry.userId),
                      }}
                      size={28}
                      ring={false}
                    />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="min-w-0 truncate text-[12.5px] font-medium tracking-tight text-(--text-primary)">
                        {entry.actorName}
                      </p>

                      <time
                        dateTime={entry.createdAt}
                        className="shrink-0 font-mono text-[9px] tabular-nums text-(--text-subtle)"
                      >
                        {relativeTime(entry.createdAt)}
                      </time>
                    </div>

                    <p className="mt-1 text-[12px] leading-5 text-(--text-secondary)">
                      {entry.message}
                    </p>

                    {(entry.workspaceName || entry.boardName) && (
                      <p className="mt-1.5 truncate font-mono text-[9px] uppercase tracking-wider text-(--text-subtle)">
                        {[entry.workspaceName, entry.boardName]
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

        {!hasNextPage && entries.length > 0 && (
          <p className="py-3 text-center text-[10px] uppercase tracking-wider text-(--text-subtle)">
            End of activity
          </p>
        )}
      </section>
    </BoardShell>
  );
}
