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
    <div className="min-h-52 bg-[#0c0c0e] p-4 sm:min-h-60">
      <div className="mb-5 flex items-center justify-between">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">
          {title}
        </span>

        <span className="font-mono text-[10px] text-neutral-700">{count}</span>
      </div>

      <div className="space-y-2">
        {cards.map((card) => (
          <div
            key={card}
            className="border border-neutral-800 bg-[#101012] px-3 py-3"
          >
            <p className="text-xs text-neutral-300">{card}</p>

            <div className="mt-3 flex items-center justify-between">
              <span className="h-px w-8 bg-neutral-800" />

              <span className="font-mono text-[9px] text-neutral-700">
                SYNCED
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
