import { WorkspaceItem } from "./WorkspaceItem";

export function WorkspacePreview() {
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
            kanban.local/workspace
          </span>

          <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-700">
            new
          </span>
        </div>

        {/* Workspace */}
        <div className="p-5 sm:p-7">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-5">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-700">
                Workspace
              </p>

              <h3 className="mt-2 font-mono text-sm font-bold text-neutral-200">
                Product Team
              </h3>
            </div>

            <span className="border border-emerald-900/60 px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-emerald-600">
              Active
            </span>
          </div>

          {/* Workspace information */}
          <div className="mt-6 grid gap-px border border-neutral-800 bg-neutral-800 sm:grid-cols-2">
            <WorkspaceItem label="Workspace" value="product-team" />

            <WorkspaceItem label="Members" value="04" />

            <WorkspaceItem label="Boards" value="03" />

            <WorkspaceItem label="Status" value="Ready" />
          </div>

          {/* Action */}
          <div className="mt-6 flex items-center justify-between border border-neutral-800 bg-[#0c0c0c] px-4 py-3">
            <span className="font-mono text-[10px] text-neutral-600">
              workspace://ready
            </span>

            <span className="font-mono text-[10px] text-rose-500">
              CREATE BOARD →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
