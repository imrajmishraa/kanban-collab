import React from 'react'

interface CollaborationColumnProps {
  title: string;
  count: string;
  cards: string[];
}

function CollaborationColumn({
  title,
  count,
  cards,
}: CollaborationColumnProps) {
  return (
    <div className="min-h-52 bg-[#0c0c0e] p-4 sm:min-h-60">
      <div className="mb-5 flex items-center justify-between">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">
          {title}
        </span>

        <span className="font-mono text-[10px] text-neutral-700">{count}</span>
      </div>

      <div className="space-y-2">
        {cards.map((card) => (
          <div
            key={card}
            className="border border-neutral-800 bg-[#101012] px-3 py-3"
          >
            <p className="text-xs text-neutral-300">{card}</p>

            <div className="mt-3 flex items-center justify-between">
              <span className="h-px w-8 bg-neutral-800" />

              <span className="font-mono text-[9px] text-neutral-700">
                SYNCED
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CollaborationSection() {
  return (
    <section className="border-b border-neutral-800 bg-[#080808] px-4 py-24 text-neutral-100 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
      <div className="mx-auto w-full max-w-7xl">
        {/* Heading */}
        <div className="max-w-3xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="font-mono text-[10px] text-rose-500">02</span>

            <span className="h-px w-6 bg-neutral-800" />

            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-600">
              Real-time collaboration
            </span>
          </div>

          <h2 className="font-mono text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Work together.
            <br />
            <span className="text-neutral-500">See changes instantly.</span>
          </h2>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-neutral-500 sm:text-base sm:leading-8">
            Keep your team working from the same source of truth. Changes made
            on the board are synchronized in real time across connected clients.
          </p>
        </div>

        {/* Collaboration preview */}
        <div className="mt-14 border border-neutral-800 bg-[#0c0c0e]">
          {/* Window header */}
          <div className="flex h-11 items-center justify-between border-b border-neutral-800 px-4">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full border border-rose-500"
              />

              <span className="font-mono text-[10px] text-neutral-500">
                kanban / team-board
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-emerald-500"
              />

              <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-600">
                Live
              </span>
            </div>
          </div>

          {/* Board */}
          <div className="grid gap-px bg-neutral-800 sm:grid-cols-3">
            <CollaborationColumn
              title="Todo"
              count="03"
              cards={["Design workspace", "Invite teammates"]}
            />

            <CollaborationColumn
              title="In Progress"
              count="02"
              cards={["Build collaboration", "Implement presence"]}
            />

            <CollaborationColumn
              title="Done"
              count="04"
              cards={["Project setup", "Board creation"]}
            />
          </div>

          {/* Presence */}
          <div className="flex flex-col gap-3 border-t border-neutral-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-600">
                Active now
              </span>

              <div className="flex -space-x-1.5">
                <span className="flex h-6 w-6 items-center justify-center border border-[#0c0c0e] bg-neutral-700 font-mono text-[9px] text-neutral-300">
                  R
                </span>

                <span className="flex h-6 w-6 items-center justify-center border border-[#0c0c0e] bg-neutral-800 font-mono text-[9px] text-neutral-400">
                  A
                </span>

                <span className="flex h-6 w-6 items-center justify-center border border-[#0c0c0e] bg-neutral-900 font-mono text-[9px] text-neutral-500">
                  +
                </span>
              </div>
            </div>

            <span className="font-mono text-[10px] text-neutral-700">
              state://synchronized
            </span>
          </div>
        </div>

        {/* Technology indicators */}
        <div className="mt-8 grid border border-neutral-800 sm:grid-cols-3">
          <div className="border-b border-neutral-800 p-5 sm:border-b-0 sm:border-r">
            <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-600">
              Transport
            </p>

            <p className="mt-2 font-mono text-sm text-neutral-300">
              WebSockets
            </p>
          </div>

          <div className="border-b border-neutral-800 p-5 sm:border-b-0 sm:border-r">
            <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-600">
              State
            </p>

            <p className="mt-2 font-mono text-sm text-neutral-300">Yjs</p>
          </div>

          <div className="p-5">
            <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-600">
              Presence
            </p>

            <p className="mt-2 font-mono text-sm text-neutral-300">Awareness</p>
          </div>
        </div>
      </div>
    </section>
  );
}
