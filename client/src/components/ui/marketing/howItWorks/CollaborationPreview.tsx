import { Check, Radio } from "lucide-react";
import { Activity } from "./Activity";
import { Avatar } from "./Avatar";

export function CollaborationPreview() {
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

          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

            <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-600">
              3 online
            </span>
          </div>
        </div>

        {/* Board */}
        <div className="p-4 sm:p-6">
          {/* Board header */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-700">
                Shared board
              </p>

              <h3 className="mt-2 font-mono text-sm font-bold text-neutral-200">
                Product Roadmap
              </h3>
            </div>

            {/* Active users */}
            <div className="flex -space-x-1.5">
              <Avatar label="R" active />
              <Avatar label="A" />
              <Avatar label="S" />
            </div>
          </div>

          {/* Collaboration event */}
          <div className="mt-5 border border-neutral-800 bg-[#0c0c0c]">
            <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
              <div className="flex items-center gap-2">
                <Radio size={12} strokeWidth={1.5} className="text-rose-500" />

                <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-500">
                  Live activity
                </span>
              </div>

              <span className="font-mono text-[9px] text-neutral-700">NOW</span>
            </div>

            <div className="space-y-1 p-3">
              <Activity
                user="Raj"
                action="moved"
                task="API integration"
                from="Todo"
                to="In Progress"
                active
              />

              <Activity user="Alex" action="updated" task="Board layout" />

              <Activity user="Sam" action="completed" task="Authentication" />
            </div>
          </div>

          {/* Sync status */}
          <div className="mt-4 flex items-center justify-between border border-neutral-800 px-4 py-3">
            <div className="flex items-center gap-2">
              <Check size={12} strokeWidth={1.5} className="text-emerald-500" />

              <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-600">
                All changes synchronized
              </span>
            </div>

            <span className="font-mono text-[9px] text-neutral-700">12ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}
