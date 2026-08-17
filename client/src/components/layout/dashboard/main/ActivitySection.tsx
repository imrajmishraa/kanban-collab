import ActivityItem from "@components/ui/dashboard/ActivityItem";

import type {
  DashboardActivity,
  DashboardActivityType,
} from "@/types/dashboard/dashboard";

interface ActivitySectionProps {
  activities?: DashboardActivity[];
}

export default function ActivitySection({
  activities = [],
}: ActivitySectionProps) {
  return (
    <section className="mt-12">
      <div className="border-b border-neutral-800 pb-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-600">
          Recent activity
        </p>

        <h2 className="mt-2 font-mono text-sm font-semibold text-neutral-200">
          What's happening
        </h2>
      </div>

      <div className="mt-1">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <ActivityItem
              key={activity.id}
              time={formatActivityTime(activity.createdAt)}
              action={formatActivityAction(activity.type)}
              description={activity.message}
            />
          ))
        ) : (
          <div className="border-b border-neutral-900 px-1 py-8">
            <p className="font-mono text-xs text-neutral-600">
              No recent activity.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function formatActivityTime(createdAt: string): string {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function formatActivityAction(type: DashboardActivityType): string {
  switch (type) {
    case "board_created":
      return "Board created";

    case "board_updated":
      return "Board updated";

    case "card_created":
      return "Card created";

    case "card_updated":
      return "Card updated";

    case "card_completed":
      return "Task completed";

    case "member_added":
      return "Member added";

    default:
      return "Activity";
  }
}
