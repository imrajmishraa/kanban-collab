import WorkspaceCard from "@components/ui/dashboard/WorkspaceCard";

import type { DashboardWorkspace } from "@/types/dashboard/dashboard";

interface WorkspaceSectionProps {
  workspaces: DashboardWorkspace[];
}

export default function WorkspaceSection({
  workspaces,
}: WorkspaceSectionProps) {
  return (
    <section className="mt-12">
      <div className="flex items-end justify-between border-b border-neutral-800 pb-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-600">
            Workspaces
          </p>

          <h2 className="mt-2 font-mono text-sm font-semibold text-neutral-200">
            Your workspaces
          </h2>
        </div>

        <button
          type="button"
          className="font-mono text-[10px] uppercase tracking-wider text-neutral-600 transition-colors hover:text-neutral-300"
        >
          [ View all ]
        </button>
      </div>

      {workspaces.length === 0 ? (
        <div className="mt-5 border border-neutral-800 px-5 py-8">
          <p className="font-mono text-xs text-neutral-600">
            No workspaces found.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {workspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace.id}
              id={workspace.id}
              name={workspace.name}
              boardCount={workspace.boardCount}
              activeTaskCount={workspace.activeTaskCount}
            />
          ))}
        </div>
      )}
    </section>
  );
}
