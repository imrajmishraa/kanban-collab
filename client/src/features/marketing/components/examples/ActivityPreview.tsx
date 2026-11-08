import BoardBar from "./BoardBar";

interface LogEntry {
  text: string;
  time: string;
  mark?: boolean;
}

const LOG: LogEntry[] = [
  { text: "Riya moved “Presence dot” to Review", time: "14:02", mark: true },
  { text: "Aditya commented on “Idle socket cleanup”", time: "13:47" },
  { text: "Meera created “Column reorder”", time: "12:30" },
  { text: "Kabir merged two cards into one", time: "11:58", mark: true },
];

/** The log: what moved, who moved it, and when. */
export default function ActivityPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-(--hairline) bg-(--bg-surface)">
      <BoardBar title="Activity · payments">
        <span className="rounded-sm bg-(--tint-4) px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.08em] text-(--text-secondary)">
          Today
        </span>
      </BoardBar>

      <div className="px-3.5 py-2.5">
        {LOG.map((entry, index) => (
          <div
            key={entry.text}
            className="relative grid grid-cols-[15px_minmax(0,1fr)] gap-2.5 py-2.5"
          >
            {index < LOG.length - 1 ? (
              <span className="absolute top-5.5 bottom-0 left-1.75 w-px bg-(--hairline)" />
            ) : null}
            <span
              className={[
                "mt-px size-3.5 rounded-full border",
                entry.mark
                  ? "border-(--brand) bg-(--brand)"
                  : "border-(--hairline) bg-(--tint-6)",
              ].join(" ")}
            />
            <span>
              <span className="block text-[11.5px] leading-normal text-(--text-secondary)">
                {entry.text}
              </span>
              <span className="mt-0.5 block font-mono text-[9px] tracking-[0.06em] text-(--text-subtle)">
                {entry.time}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
