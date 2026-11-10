import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon } from "@hugeicons/core-free-icons";

const COLUMNS = [
  {
    title: "Self-hosted",
    note: "Free, MIT licensed",
    points: [
      "Your MongoDB, your hostname",
      "Unlimited workspaces and seats",
      "Docker compose, one command",
    ],
  },
  {
    title: "Managed",
    note: "Early access",
    points: [
      "No servers to watch",
      "Backups and upgrades handled",
      "Invite by email, not by SSH",
    ],
  },
];

const CARDS = [
  { title: "Auth on WS", tag: "API" },
  { title: "Presence dot", tag: "Sync" },
  { title: "Idle cleanup", tag: "WS" },
];

/**
 * The split band: the argument on the left, the product on the right.
 *
 * The right side is drawn, not photographed — a window with a board in it and a
 * share dialog floating over the top, which is the one screen that shows both
 * "it is a real app" and "it is a real board" without a caption.
 */
export default function SolutionsSplit() {
  return (
    <section className="border-b border-(--hairline) bg-(--bg-surface)">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="max-w-130 font-sans text-[30px] font-bold leading-[1.15] tracking-[-1.1px] text-(--text-primary) sm:text-[36px] md:text-[40px]">
              Run it on your own terms.
            </h2>

            <p className="mt-5 max-w-130 text-[15px] leading-[1.7] text-(--text-secondary) sm:text-[17px]">
              The same board either way. One you own end to end, one we keep
              running for you — and you can move between them, because it is the
              same database schema and the same client.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
              {COLUMNS.map((column) => (
                <div key={column.title}>
                  <h3 className="text-[16px] font-semibold text-(--text-primary)">
                    {column.title}
                  </h3>
                  <p className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-(--text-subtle)">
                    {column.note}
                  </p>

                  <ul className="mt-3 flex flex-col gap-2">
                    {column.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2 text-[13.5px] leading-normal text-(--text-secondary)"
                      >
                        <span className="mt-0.5 shrink-0 text-(--success)">
                          <HugeiconsIcon
                            icon={Tick02Icon}
                            size={13}
                            strokeWidth={2.6}
                            aria-hidden="true"
                          />
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link to="/workspaces" className="m-btn">
                Start free
              </Link>
              <Link to="/pricing" className="m-btn-outline">
                See pricing
              </Link>
            </div>
          </div>

          {/* the window */}
          <div className="relative">
            <div className="overflow-hidden rounded-xl border border-(--hairline) bg-(--bg-root)">
              <div className="flex items-center gap-1.5 border-b border-(--hairline) bg-(--bg-surface) px-3 py-2">
                <span className="size-2 rounded-full bg-(--tint-15)" />
                <span className="size-2 rounded-full bg-(--tint-15)" />
                <span className="size-2 rounded-full bg-(--tint-15)" />
                <span className="ml-2 text-[11px] font-medium text-(--text-secondary)">
                  Payments · Sprint 24
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3">
                {["Backlog", "In progress", "Review"].map((column, index) => (
                  <div key={column}>
                    <p className="mb-1.5 font-mono text-[8px] uppercase tracking-[0.14em] text-(--text-muted)">
                      {column}
                    </p>
                    {CARDS.slice(index === 2 ? 2 : 0, index === 2 ? 3 : 2).map(
                      (card) => (
                        <div
                          key={card.title}
                          className="mb-1.5 rounded-md border border-(--hairline) bg-(--bg-surface) p-2"
                        >
                          <p className="truncate text-[10.5px] font-medium text-(--text-primary)">
                            {card.title}
                          </p>
                          <span className="mt-1 inline-block rounded-sm bg-(--tint-4) px-1 py-0.5 font-mono text-[7.5px] uppercase tracking-[0.08em] text-(--text-muted)">
                            {card.tag}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* the dialog that floats over it */}
            <div className="absolute -bottom-6 left-1/2 w-60 -translate-x-1/2 rounded-lg border border-(--hairline) bg-(--bg-surface) p-3 shadow-[0_18px_44px_-16px_rgba(0,0,0,0.35)]">
              <p className="text-[11.5px] font-semibold text-(--text-primary)">
                Share this board
              </p>
              <div className="mt-2 flex items-center gap-1">
                {["RM", "AD", "ME"].map((initials) => (
                  <span
                    key={initials}
                    className="grid size-5 place-items-center rounded-full border border-(--bg-surface) bg-(--tint-10) text-[7px] font-bold text-(--text-primary)"
                  >
                    {initials}
                  </span>
                ))}
                <span className="ml-1 text-[10px] text-(--text-muted)">
                  3 people can edit
                </span>
              </div>
              <div className="mt-2.5 rounded-md bg-(--brand) px-2 py-1 text-center text-[10.5px] font-semibold text-(--solid-text)">
                Send invite
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
