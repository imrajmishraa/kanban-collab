import React from "react";

const columns = [
  {
    title: "To Do",
    cards: ["Design landing page", "Create workspace"],
  },
  {
    title: "In Progress",
    cards: ["WebSocket sync", "Build dashboard"],
  },
  {
    title: "Done",
    cards: ["Authentication", "MongoDB setup"],
  },
];

export default function BoardPreview() {
  return (
    <div className="relative">
      {/* Window */}
      <div className="overflow-hidden border border-neutral-700 bg-[#111113] shadow-2xl shadow-black/30">
        {/* Window header */}
        <div className="flex h-12 items-center border-b border-neutral-800 px-4 sm:px-5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border border-rose-500/80" />
            <span className="h-2.5 w-2.5 rounded-full border border-yellow-500/80" />
            <span className="h-2.5 w-2.5 rounded-full border border-emerald-500/80" />
          </div>

          <div className="ml-5 font-mono text-xs text-neutral-600">
            kanban.board
          </div>

          <div className="ml-auto font-mono text-[10px] text-neutral-700">
            LIVE
          </div>
        </div>

        {/* Board */}
        <div className="grid grid-cols-1 sm:grid-cols-3">
          {columns.map((column, columnIndex) => (
            <div
              key={column.title}
              className={`
                min-h-52 p-4 sm:min-h-64 sm:p-5
                ${
                  columnIndex !== columns.length - 1
                    ? "border-b border-neutral-800 sm:border-b-0 sm:border-r"
                    : ""
                }
              `}
            >
              {/* Column header */}
              <div className="mb-5 flex items-center justify-between">
                <span className="font-mono text-xs text-neutral-500">
                  {column.title}
                </span>

                <span className="font-mono text-[10px] text-neutral-700">
                  {String(column.cards.length).padStart(2, "0")}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                {column.cards.map((card, index) => (
                  <div
                    key={card}
                    className={`
                      border
                      border-neutral-800
                      bg-[#171719]
                      p-3
                      transition-colors
                      hover:border-neutral-700
                      ${column.title === "Done" ? "opacity-70" : ""}
                    `}
                  >
                    <p className="font-mono text-xs leading-5 text-neutral-400">
                      {card}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-mono text-[9px] text-neutral-700">
                        TASK-{columnIndex + 1}
                        {index + 1}
                      </span>

                      {column.title === "Done" && (
                        <span className="text-[10px] text-emerald-500">✓</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Terminal label */}
      <div className="absolute -bottom-3 left-5 border border-neutral-800 bg-[#0c0c0e] px-3 py-1">
        <span className="font-mono text-[10px] text-neutral-600">
          workspace://kanban
        </span>
      </div>
    </div>
  );
}