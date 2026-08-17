interface ActivityItemProps {
  time: string;
  action: string;
  description: string;
}

export default function ActivityItem({
  time,
  action,
  description,
}: ActivityItemProps) {
  return (
    <article className="group grid grid-cols-[64px_1fr] gap-4 border-b border-neutral-800 py-4 last:border-b-0 sm:grid-cols-[72px_1fr]">
      <time className="font-mono text-[10px] text-neutral-700">{time}</time>

      <div className="min-w-0">
        <p className="text-sm text-neutral-300 transition-colors group-hover:text-neutral-100">
          {action}
        </p>

        <p className="mt-1 text-xs text-neutral-600">{description}</p>
      </div>
    </article>
  );
}
