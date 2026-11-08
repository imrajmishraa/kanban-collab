import BoardBar from "./BoardBar";
import Tag from "./Tag";
import Avatar from "./Avatar";

interface ListRow {
  title: string;
  meta: string;
  tag: string;
  brand?: boolean;
  done?: boolean;
  who: "R" | "A" | "M" | "K";
}

const ROWS: ListRow[] = [
  {
    title: "Auth middleware on WS upgrades",
    meta: "Done · Riya",
    tag: "Done",
    brand: true,
    done: true,
    who: "R",
  },
  {
    title: "Presence dot on board cards",
    meta: "Done · Aditya",
    tag: "Done",
    brand: true,
    done: true,
    who: "A",
  },
  {
    title: "Idle socket cleanup",
    meta: "In progress · Kabir",
    tag: "WS",
    done: false,
    who: "K",
  },
  {
    title: "Column reorder merges cleanly",
    meta: "Review · Meera",
    tag: "Yjs",
    done: false,
    who: "M",
  },
];

/** The list view: the same cards as rows, with the status on the right. */
export default function ListPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-(--hairline) bg-(--bg-surface)">
      <BoardBar title="Sprint 24 · List">
        <span className="rounded-sm bg-(--tint-4) px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.08em] text-(--text-secondary)">
          14 cards
        </span>
      </BoardBar>

      <div className="px-3 py-2">
        {ROWS.map((row) => (
          <div
            key={row.title}
            className="grid grid-cols-[13px_minmax(0,1fr)_auto_auto] items-center gap-2.5 border-b border-(--hairline) py-2.5 last:border-b-0"
          >
            <span
              className={[
                "size-3.25 rounded-full border",
                row.done
                  ? "border-(--brand) bg-(--brand)"
                  : "border-(--hairline-strong)",
              ].join(" ")}
            />
            <span className="min-w-0">
              <b className="block truncate text-[12px] font-semibold tracking-[-0.1px] text-(--text-primary)">
                {row.title}
              </b>
              <span className="block truncate text-[10px] text-(--text-muted)">
                {row.meta}
              </span>
            </span>
            <Tag label={row.tag} brand={row.brand} />
            <Avatar initials={row.who} />
          </div>
        ))}
      </div>
    </div>
  );
}
