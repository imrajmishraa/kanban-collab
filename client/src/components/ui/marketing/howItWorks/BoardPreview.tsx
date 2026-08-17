import React from "react";
import { BoardColumn } from "./BoardColumn";

export function BoardPreview() {
  return (
    <div className="border border-neutral-800 bg-[#0c0c0c] p-2">
      <div className="border border-neutral-800 bg-[#080808]">
        {/* Application chrome */}
        <div className="flex h-10 items-center justify-between border-b border-neutral-800 px-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border border-rose-500" />
            <span className="h-2.5 w-2.5 rounded-full border border-yellow-500" />
            <span className="h-2.5 w-2.5 rounded-full border border-emerald-500" />
          </div>

          <span className="font-mono text-[10px] text-neutral-700">
            kanban.local/board
          </span>

          <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-700">
            live
          </span>
        </div>

        {/* Board */}
        <div className="p-4 sm:p-6">
          {/* Board header */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-700">
                Board
              </p>

              <h3 className="mt-2 font-mono text-sm font-bold text-neutral-200">
                Product Roadmap
              </h3>
            </div>

            <span className="font-mono text-[9px] text-neutral-600">
              09 tasks
            </span>
          </div>

          {/* Columns */}
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <BoardColumn
              title="Todo"
              count="03"
              tasks={["Design board layout", "Create task filters"]}
            />

            <BoardColumn
              title="In Progress"
              count="02"
              active
              tasks={["Real-time collaboration", "API integration"]}
            />

            <BoardColumn
              title="Done"
              count="04"
              tasks={["Authentication", "Workspace setup"]}
            />
          </div>

          {/* Board status */}
          <div className="mt-5 flex items-center justify-between border-t border-neutral-800 pt-4">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-emerald-500" />

              <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-600">
                Board active
              </span>
            </div>

            <span className="font-mono text-[9px] text-neutral-700">
              updated just now
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}