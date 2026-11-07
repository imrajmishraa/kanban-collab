import type { ReactNode } from "react";

import { Avatar } from "./parts";

/**
 * The three previews the views section swaps between.
 *
 * They are the same board in three registers — a column view, a list, and the
 * log — drawn with the app's own density: 12px card text, mono column heads,
 * hairline dividers. Nothing here knows about the theme; the section puts
 * `.dark-theme` on the wrapper and the tokens do the rest.
 */

interface PreviewCard {
  tag: string;
  tagBrand?: boolean;
  who?: "R" | "A" | "M" | "K";
}

interface PreviewColumn {
  title: string;
  count: string;
  cards: PreviewCard[];
}

const COLUMNS: PreviewColumn[] = [
  {
    title: "Backlog",
    count: "02",
    cards: [
      { tag: "API", tagBrand: false, who: "A" as const },
      { tag: "Domain", tagBrand: false },
    ],
  },
  {
    title: "In progress",
    count: "02",
    cards: [
      { tag: "Awareness", tagBrand: true, who: "R" as const },
      { tag: "WS", tagBrand: false, who: "K" as const },
    ],
  },
  {
    title: "Review",
    count: "01",
    cards: [{ tag: "Yjs", tagBrand: true, who: "M" as const }],
  },
];

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
    who: "R" as const,
  },
  {
    title: "Presence dot on board cards",
    meta: "Done · Aditya",
    tag: "Done",
    brand: true,
    done: true,
    who: "A" as const,
  },
  {
    title: "Idle socket cleanup",
    meta: "In progress · Kabir",
    tag: "WS",
    brand: false,
    done: false,
    who: "K" as const,
  },
  {
    title: "Column reorder merges cleanly",
    meta: "Review · Meera",
    tag: "Yjs",
    brand: false,
    done: false,
    who: "M" as const,
  },
];

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

function BoardBar({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-(--hairline) px-3 py-2.5">
      <span className="text-[13px] font-semibold tracking-[-0.2px] text-(--text-primary)">
        {title}
      </span>
      <span className="flex-1" />
      {children}
    </div>
  );
}

function Tag({ label, brand }: { label: string; brand?: boolean }) {
  return (
    <span
      className={[
        "rounded-sm px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.08em]",
        brand
          ? "bg-(--brand-wash) text-(--brand)"
          : "bg-(--tint-4) text-(--text-secondary)",
      ].join(" ")}
    >
      {label}
    </span>
  );
}

export function BoardPreview({ compact = false }: { compact?: boolean }) {
  return (
    <div className="overflow-hidden rounded-xl border border-(--hairline) bg-(--bg-surface)">
      <BoardBar title="Payments · Sprint 24">
        <span className="rounded-sm border border-(--brand-line) bg-(--brand-wash) px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-(--brand)">
          3 editing
        </span>
        <div className="faces flex">
          <Avatar initials="R" />
          <Avatar initials="A" tone="blue" className="-ml-1.5" />
          <Avatar initials="M" tone="green" className="-ml-1.5" />
        </div>
      </BoardBar>

      <div className="grid grid-cols-3 gap-2 bg-(--bg-root) p-3">
        {COLUMNS.map((column) => (
          <div key={column.title} className="min-w-0">
            <div className="flex items-center gap-1.5 pb-1.5 font-mono text-[8.5px] uppercase tracking-[0.14em] text-(--text-muted)">
              {column.title}
              <span className="flex-1" />
              {column.count}
            </div>

            {column.cards.map((card, index) => (
              <div
                key={index}
                className={[
                  "mb-1.5 rounded-lg border border-(--hairline) bg-(--bg-surface)",
                  compact ? "p-1.5" : "p-2.5",
                ].join(" ")}
              >
                <span className="mb-1 block h-1.5 w-4/5 rounded-sm bg-(--tint-15)" />
                <span className="mb-1 block h-1.5 w-3/5 rounded-sm bg-(--tint-10)" />
                {!compact ? (
                  <span className="block h-1.5 w-[45%] rounded-sm bg-(--tint-10)" />
                ) : null}
                <div className="mt-2 flex items-center gap-1.5">
                  <Tag label={card.tag} brand={card.tagBrand} />
                  <span className="flex-1" />
                  {card.who ? <Avatar initials={card.who} /> : null}
                </div>
              </div>
            ))}

            {column.title === "Review" ? (
              <div className="rounded-lg border border-dashed border-(--hairline) p-2.5">
                <span className="block h-1.5 w-[45%] rounded-sm bg-(--tint-10)" />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListPreview() {
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

export function ActivityPreview() {
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
