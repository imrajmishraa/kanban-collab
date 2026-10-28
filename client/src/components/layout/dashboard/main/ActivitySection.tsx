import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  KanbanIcon,
  RefreshIcon,
  Message01Icon,
  Note01Icon,
  Tick02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

import type {
  DashboardActivity,
  DashboardActivityType,
} from "@/types/dashboard/dashboard";

interface ActivitySectionProps {
  activities?: DashboardActivity[];
  /** Renders a "View all" affordance in the header when supplied. */
  onViewAll?: () => void;
  /** Refetches the feed. The button only renders when this is supplied. */
  onRefresh?: () => void;
  isRefreshing?: boolean;
  /** Clicking a row opens the board the activity happened on. */
  onOpenBoard?: (boardId: string) => void;
}

/** Each activity type gets its own glyph, so the feed scans by shape. */
const ACTIVITY_ICON: Record<DashboardActivityType, typeof Note01Icon> = {
  board_created: KanbanIcon,
  board_updated: KanbanIcon,
  card_created: Note01Icon,
  card_updated: Note01Icon,
  card_completed: Tick02Icon,
  member_added: UserGroupIcon,
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return "--";
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function ActivitySection({
  activities = [],
  onViewAll,
  onRefresh,
  isRefreshing = false,
  onOpenBoard,
}: ActivitySectionProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-orange-50/15 bg-white/3">
      <header className="flex items-center justify-between border-b border-orange-50/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md border border-orange-50/15 text-neutral-500">
            <HugeiconsIcon icon={Message01Icon} size={12} strokeWidth={1.7} />
          </span>
          <p className="text-[12.5px] font-medium tracking-tight text-neutral-100">
            Recent activity
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activities.length > 0 && (
            <span className="font-mono text-[10px] tabular-nums text-neutral-500">
              {activities.length}
            </span>
          )}

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Refresh activity"
              className="flex size-6 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors duration-200 hover:bg-white/6 hover:text-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <HugeiconsIcon
                icon={RefreshIcon}
                size={12}
                strokeWidth={1.8}
                className={isRefreshing ? "animate-spin" : undefined}
              />
            </button>
          )}

          {onViewAll && (
            <button
              type="button"
              onClick={onViewAll}
              className="group/all flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-neutral-500 transition-colors duration-200 hover:bg-white/6 hover:text-neutral-200"
            >
              View all
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={11}
                strokeWidth={2}
                className="shrink-0 transition-transform duration-200 group-hover/all:translate-x-0.5"
              />
            </button>
          )}
        </div>
      </header>

      {activities.length === 0 ? (
        <p className="px-4 py-16 text-center text-[12px] text-neutral-500">
          Nothing here yet
        </p>
      ) : (
        <ul className="h-130 max-h-[72vh] divide-y divide-orange-50/6 overflow-y-auto">
          {activities.map((activity) => {
            const actor = activity.actor?.name?.trim() || "Unknown member";
            const icon = ACTIVITY_ICON[activity.type] ?? Message01Icon;
            const place = [activity.workspaceName, activity.boardName]
              .filter(Boolean)
              .join(" / ");

            const boardId = activity.boardId;
            const clickable = Boolean(boardId && onOpenBoard);

            return (
              <li key={activity.id}>
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => {
                    if (boardId && onOpenBoard) onOpenBoard(boardId);
                  }}
                  className={[
                    "flex w-full gap-3 px-4 py-3.5 text-left transition-colors duration-200",
                    clickable
                      ? "cursor-pointer hover:bg-white/4"
                      : "cursor-default",
                  ].join(" ")}
                >
                  <span className="relative mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-orange-50/15 bg-white/4 text-[10px] font-semibold tracking-wider text-neutral-300">
                    {initials(actor)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="min-w-0 truncate text-[12px] font-medium tracking-tight text-neutral-100">
                        {actor}
                      </p>
                      <time
                        dateTime={activity.createdAt}
                        className="shrink-0 font-mono text-[9px] tabular-nums text-neutral-600"
                      >
                        {relativeTime(activity.createdAt)}
                      </time>
                    </div>

                    <div className="mt-1 flex items-start gap-1.5">
                      <HugeiconsIcon
                        icon={icon}
                        size={12}
                        strokeWidth={1.6}
                        className="mt-1 shrink-0 text-neutral-600"
                      />
                      <p className="min-w-0 text-[11.5px] leading-5 text-neutral-400">
                        {activity.message}
                      </p>
                    </div>

                    {place && (
                      <p className="mt-1.5 truncate pl-4.5 font-mono text-[9px] uppercase tracking-wider text-neutral-600">
                        {place}
                      </p>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
