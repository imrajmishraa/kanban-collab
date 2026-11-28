import type { DemoCard } from "./dragDemoBoard";

interface DemoCardBodyProps {
  card: DemoCard;
  /** The card in hand: one step up in surface, brand hairline. */
  lifted?: boolean;
}

/** One card of the faux board. Fixed height, so the open slot it leaves behind
 *  is the same size and the drop never shifts the column. */
export default function DemoCardBody({ card, lifted }: DemoCardBodyProps) {
  return (
    <div
      className={[
        "flex h-[54px] flex-col justify-center gap-1.5 rounded-lg border px-2.5",
        lifted
          ? "border-(--brand-line) bg-(--bg-elevated)"
          : "border-(--hairline) bg-(--bg-root)",
      ].join(" ")}
    >
      <span className="truncate text-[11.5px] leading-none font-medium text-(--text-primary)">
        {card.title}
      </span>
      <span className="flex items-center gap-1.5">
        <span className="rounded-sm border border-(--hairline) px-1 py-px font-mono text-[8px] tracking-[0.08em] text-(--text-muted) uppercase">
          {card.tag}
        </span>
        {card.due ? (
          <span className="font-mono text-[8px] text-(--text-muted)">
            {card.due}
          </span>
        ) : null}
      </span>
    </div>
  );
}
