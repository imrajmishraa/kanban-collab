import type { DashboardBoard } from "@/types/dashboard/dashboard";

interface RecentBoardsSectionProps {
  boards: DashboardBoard[];
}

export default function RecentBoardsSection({
  boards,
}: RecentBoardsSectionProps) {
  return (
    <section className="mt-12">
      <div className="flex items-end justify-between border-b border-neutral-800 pb-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-600">
            Boards
          </p>

          <h2 className="mt-2 font-mono text-sm font-semibold text-neutral-200">
            Recent boards
          </h2>
        </div>

        <button
          type="button"
          className="font-mono text-[10px] uppercase tracking-wider text-neutral-600 transition-colors hover:text-neutral-300"
        >
          [ View all ]
        </button>
      </div>

      {boards.length === 0 ? (
        <div className="mt-5 border border-neutral-800 px-5 py-8">
          <p className="font-mono text-xs text-neutral-600">No boards found.</p>
        </div>
      ) : (
        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <article
              key={board.id}
              className="group border border-neutral-800 bg-[#080808] transition-colors hover:border-neutral-700 hover:bg-[#0c0c0e]"
            >
              <div
                className="h-1"
                style={{
                  backgroundColor: board.backgroundColor,
                }}
              />

              <div className="p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-600">
                  {board.workspaceName}
                </p>

                <h3 className="mt-3 font-mono text-sm font-semibold text-neutral-200 transition-colors group-hover:text-white">
                  {board.name}
                </h3>

                <p className="mt-4 font-mono text-[10px] text-neutral-600">
                  Updated {new Date(board.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
