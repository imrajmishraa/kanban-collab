import { HugeiconsIcon } from "@hugeicons/react";
import { Message01Icon } from "@hugeicons/core-free-icons";

import type { DashboardActivity } from "@/types/dashboard/dashboard";

interface ActivitySectionProps {
  activities?: DashboardActivity[];
}

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
}: ActivitySectionProps) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-white/8 bg-white/3">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/6 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md border border-white/10 bg-white/4 text-(--text-muted)">
            <HugeiconsIcon icon={Message01Icon} size={12} strokeWidth={1.7} />
          </span>
          <p className="font-mono text-[11px] text-(--text-primary)">
            Recent activity
          </p>
        </div>

        {activities.length > 0 && (
          <span className="font-mono text-[10px] tabular-nums text-(--text-muted)">
            {activities.length}
          </span>
        )}
      </header>

      {/* Body */}
      {activities.length === 0 ? (
        <p className="px-4 py-8 text-center font-mono text-[11px] text-(--text-muted)">
          No recent activity.
        </p>
      ) : (
        <ul className="max-h-112 divide-y divide-white/6 overflow-y-auto">
          {activities.map((activity) => {
            const actor = activity.actor?.name?.trim() || "Someone";

            return (
              <li key={activity.id} className="flex gap-3 px-4 py-3">
                {/* Avatar */}
                <span
                  className="
                    mt-0.5 flex size-7 shrink-0 items-center justify-center
                    rounded-full border border-white/10 bg-white/4
                    font-mono text-[10px] font-semibold tracking-wider
                    text-(--text-secondary)
                  "
                >
                  {initials(actor)}
                </span>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="min-w-0 truncate font-mono text-[11px] text-(--text-primary)">
                      {actor}
                    </p>
                    <time
                      dateTime={activity.createdAt}
                      className="shrink-0 font-mono text-[9px] tabular-nums text-(--text-muted)"
                    >
                      {relativeTime(activity.createdAt)}
                    </time>
                  </div>

                  <p className="mt-0.5 line-clamp-2 font-mono text-[11px] leading-5 text-(--text-secondary)">
                    {activity.message}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
