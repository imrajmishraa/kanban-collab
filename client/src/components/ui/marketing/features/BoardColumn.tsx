import type { ReactNode } from "react";

export interface BoardColumnProps {
  title: string;
  count: string;
  cards: string[];
}

export function BoardColumn({ title, count, cards }: BoardColumnProps) {
  return (
    <article className="min-h-56 bg-[#0c0c0e] p-4 sm:min-h-64">
      {/* Column header */}
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-neutral-400">
          {title}
        </h3>

        <span className="font-mono text-[10px] text-neutral-600">{count}</span>
      </div>

      {/* Cards */}
      <div className="space-y-2">
        {cards.map((card) => (
          <div
            key={card}
            className="border border-neutral-800 bg-[#101012] px-3 py-3 transition-colors hover:border-neutral-700"
          >
            <p className="text-xs text-neutral-300">{card}</p>

            <div className="mt-3 flex items-center justify-between">
              <span aria-hidden="true" className="h-px w-10 bg-neutral-800" />

              <span className="font-mono text-[9px] text-neutral-700">
                CARD
              </span>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
