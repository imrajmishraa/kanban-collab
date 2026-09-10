import type { DashboardBoard } from "@/types/dashboard/dashboard";

interface RecentBoardsSectionProps {
  boards: DashboardBoard[];
}

export default function RecentBoardsSection({
  boards,
}: RecentBoardsSectionProps) {
  return (
    <section className="mt-12">
      <div
        className="
          flex items-end justify-between
          border-b border-(--border)
          pb-3
        "
      >
        <div>
          <p
            className="
              font-mono text-[10px] uppercase
              tracking-[0.18em]
              text-(--text-muted)
            "
          >
            Boards
          </p>

          <h2
            className="
              mt-2
              font-mono text-sm font-semibold
              text-(--text-primary)
            "
          >
            Recent boards
          </h2>
        </div>

        <button
          type="button"
          className="
            cursor-pointer
            font-mono text-[10px] uppercase
            tracking-wider
            text-(--text-muted)
            transition-all duration-150
            hover:text-(--text-primary)
          "
        >
          [ View all ]
        </button>
      </div>

      {boards.length === 0 ? (
        <div
          className="
            mt-5
            border border-(--border)
            bg-(--surface-elevated)
            px-5 py-8
          "
        >
          <p
            className="
              font-mono text-xs
              text-(--text-muted)
            "
          >
            No boards found.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <article
              key={board.id}
              className="
                group
                border border-(--border)
                bg-(--card)
                transition-all duration-150
                hover:border-(--brand)
                hover:bg-(--hover)
              "
            >
              <div
                className="h-1"
                style={{
                  backgroundColor: board.backgroundColor,
                }}
              />

              <div className="p-5">
                <p
                  className="
                    font-mono text-[10px] uppercase
                    tracking-[0.16em]
                    text-(--text-muted)
                  "
                >
                  {board.workspaceName}
                </p>

                <h3
                  className="
                    mt-3
                    font-mono text-sm font-semibold
                    text-(--text-primary)
                    transition-colors duration-150
                    group-hover:text-white
                  "
                >
                  {board.name}
                </h3>

                <p
                  className="
                    mt-4
                    font-mono text-[10px]
                    text-(--text-muted)
                  "
                >
                  Updated{" "}
                  {new Date(board.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
