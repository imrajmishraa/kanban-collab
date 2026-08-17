import { MiniColumn } from "./MiniColumn";

export function SharedBoardPreview() {
  return (
    <div className="mt-8 border border-neutral-800 bg-[#080808]">
      {/* Board header */}
      <div className="flex flex-col gap-3 border-b border-neutral-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-700">
            Shared state
          </p>

          <h3 className="mt-1.5 font-mono text-xs font-bold text-neutral-300">
            Product Roadmap
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

          <span className="font-mono text-[9px] text-neutral-600">
            synchronized
          </span>
        </div>
      </div>

      {/* Board content */}
      <div className="grid gap-px bg-neutral-800 sm:grid-cols-3">
        <MiniColumn
          title="Todo"
          count="03"
          tasks={["Design filters", "Task details"]}
        />

        <MiniColumn
          title="In Progress"
          count="02"
          tasks={["Real-time sync", "Board updates"]}
          active
        />

        <MiniColumn
          title="Done"
          count="04"
          tasks={["Authentication", "Workspace"]}
        />
      </div>

      {/* Sync footer */}
      <div className="flex flex-col gap-2 border-t border-neutral-800 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <span className="font-mono text-[9px] text-neutral-700">
          last event: board.update
        </span>

        <span className="font-mono text-[9px] text-emerald-600">
          synced across clients
        </span>
      </div>
    </div>
  );
}
