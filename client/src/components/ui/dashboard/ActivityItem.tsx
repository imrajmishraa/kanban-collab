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
    <article
      className="
        group grid grid-cols-[56px_1fr] items-start gap-4
        border-b border-white/6 py-4
        transition-colors duration-200
        last:border-b-0
        hover:bg-white/1.5
        sm:grid-cols-[64px_1fr] sm:gap-5
      "
    >
      {/* ── Left column: time + timeline marker ─────────────── */}
      <div className="flex flex-col items-end gap-2 pt-0.5">
        <time className="font-mono text-[10px] tabular-nums tracking-wider text-(--text-muted)">
          {time}
        </time>

        {/* Small dot — anchors the row to a timeline */}
        <span
          aria-hidden="true"
          className="
            h-1.5 w-1.5 rounded-full bg-white/15
            transition-all duration-200
            group-hover:bg-(--brand)
            group-hover:shadow-[0_0_8px_var(--brand)]
          "
        />
      </div>

      {/* ── Right column: action + description ──────────────── */}
      <div className="min-w-0">
        <p className="font-mono text-[13px] leading-normal text-(--text-primary) transition-colors duration-200 group-hover:text-white">
          {action}
        </p>

        <p className="mt-1.5 text-[12px] leading-[1.6] text-(--text-muted)">
          {description}
        </p>
      </div>
    </article>
  );
}
