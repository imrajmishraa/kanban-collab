import React from "react";

export default function CollaborationSection() {
  return (
    <section className="border-b border-neutral-800">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center lg:gap-20 lg:px-8">
        {/* Text */}
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-rose-500">
            // Real-time collaboration
          </p>

          <h2 className="mt-4 max-w-lg font-mono text-3xl tracking-tight text-neutral-100 sm:text-4xl">
            Everyone sees the same board.
          </h2>

          <p className="mt-6 max-w-lg font-mono text-sm leading-7 text-neutral-500">
            Changes are synchronized in real time, so your team doesn't have to
            wonder whether they're looking at the latest version.
          </p>

          <div className="mt-8 space-y-3 font-mono text-xs text-neutral-500">
            <div className="flex items-center gap-3">
              <span className="text-emerald-500">✓</span>
              Instant updates
            </div>

            <div className="flex items-center gap-3">
              <span className="text-emerald-500">✓</span>
              Multi-user collaboration
            </div>

            <div className="flex items-center gap-3">
              <span className="text-emerald-500">✓</span>
              Conflict-free synchronization
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="border border-dashed border-neutral-700 bg-[#0f0f11] p-5 sm:p-7">
          <div className="border border-neutral-800">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
              <span className="font-mono text-xs text-neutral-500">
                team.workspace
              </span>

              <span className="flex items-center gap-2 font-mono text-[10px] text-emerald-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />3
                connected
              </span>
            </div>

            {/* Activity */}
            <div className="space-y-4 p-5">
              <Activity name="alex" action="moved" task="Design landing page" />

              <Activity name="sam" action="created" task="API integration" />

              <Activity name="you" action="completed" task="Authentication" />
            </div>
          </div>

          <p className="mt-4 font-mono text-[10px] text-neutral-700">
            collaboration://live
          </p>
        </div>
      </div>
    </section>
  );
}

interface ActivityProps {
  name: string;
  action: string;
  task: string;
}

function Activity({ name, action, task }: ActivityProps) {
  return (
    <div className="flex items-center gap-3 border-b border-neutral-900 pb-4 last:border-b-0 last:pb-0">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-neutral-800 bg-neutral-900 font-mono text-[10px] text-neutral-500">
        {name.charAt(0).toUpperCase()}
      </div>

      <p className="font-mono text-xs leading-5 text-neutral-600">
        <span className="text-neutral-300">{name}</span> {action}{" "}
        <span className="text-neutral-400">{task}</span>
      </p>
    </div>
  );
}