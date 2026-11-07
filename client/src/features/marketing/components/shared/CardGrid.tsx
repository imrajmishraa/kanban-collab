import type { ReactNode } from "react";

export interface GridCard {
  title: string;
  body: string;
  /** A short label in the mono register, above the title. */
  tag?: string;
  /** An optional line under the body — a name, a role, a price. */
  meta?: string;
  icon?: ReactNode;
}

interface CardGridProps {
  items: GridCard[];
  /** Two columns by default; three reads better for short cards. */
  columns?: 2 | 3;
}

/**
 * The card grid the marketing sections use: hairline frames, `--tint-3` fill,
 * a mono tag, and a title one step down from a section head.
 */
export default function CardGrid({ items, columns = 3 }: CardGridProps) {
  return (
    <div
      className={
        columns === 2
          ? "mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2"
          : "mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      }
    >
      {items.map((item) => (
        <article
          key={item.title}
          className="rounded-xl border border-(--hairline) bg-(--tint-3) p-5"
        >
          {item.icon ? (
            <span className="mb-3 flex size-8 items-center justify-center rounded-lg border border-(--hairline) text-(--text-secondary)">
              {item.icon}
            </span>
          ) : null}

          {item.tag ? (
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-(--text-secondary)/70">
              {item.tag}
            </p>
          ) : null}

          <h3 className="mt-2 text-[18px] font-semibold leading-6 tracking-[-0.3px] text-(--text-primary)">
            {item.title}
          </h3>

          <p className="mt-2 text-[14.5px] leading-6 text-(--text-secondary)">
            {item.body}
          </p>

          {item.meta ? (
            <p className="mt-4 font-mono text-[11px] text-(--text-muted)">
              {item.meta}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
