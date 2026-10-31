interface CollaborationColumnProps {
  title: string;
  count: string;
  cards: string[];
}

export function CollaborationColumn({
  title,
  count,
  cards,
}: CollaborationColumnProps) {
  return (
    <div className="min-h-52 bg-(--bg-root) p-4 sm:min-h-60">
      <div className="mb-5 flex items-center justify-between">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-(--text-muted)">
          {title}
        </span>

        <span className="font-mono text-[10px] text-(--text-subtle)">
          {count}
        </span>
      </div>

      <div className="space-y-2">
        {cards.map((card) => (
          <div
            key={card}
            className="border border-(--hairline) bg-(--bg-root) px-3 py-3"
          >
            <p className="text-xs text-(--text-soft)">{card}</p>

            <div className="mt-3 flex items-center justify-between">
              <span className="h-px w-8 bg-(--solid-bg)" />

              <span className="font-mono text-[9px] text-(--text-subtle)">
                SYNCED
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
