import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  Folder01Icon,
} from "@hugeicons/core-free-icons";

import type { Workspace } from "@/types/api/dashboard/workspace";

interface MobileWorkspaceSelectorProps {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  onWorkspaceChange: (id: string) => void;
  isLoading: boolean;
  isError: boolean;
}

export default function MobileWorkspaceSelector({
  workspaces,
  activeWorkspaceId,
  onWorkspaceChange,
  isLoading,
  isError,
}: MobileWorkspaceSelectorProps) {
  return (
    <div className="px-3 pt-3">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-(--text-muted)">
          Workspace
        </span>
      </div>

      {isError ? (
        <p className="px-1 font-mono text-[11px] text-(--danger)">
          Unable to load workspaces.
        </p>
      ) : isLoading ? (
        <MobileWorkspaceSkeleton />
      ) : workspaces.length === 0 ? (
        <p className="px-1 font-mono text-[11px] text-(--text-muted)">
          No workspaces yet.
        </p>
      ) : (
        <div className="-mx-1 flex snap-x gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-none">
          {workspaces.map((workspace) => {
            const isActive = workspace.id === activeWorkspaceId;

            return (
              <button
                key={workspace.id}
                type="button"
                onClick={() => onWorkspaceChange(workspace.id)}
                className={[
                  "flex shrink-0 snap-start items-center gap-2 rounded-lg px-2.5 py-1.5",
                  "font-mono text-[12px] transition-colors",
                  "border",
                  isActive
                    ? "border-(--brand)/40 bg-(--brand)/10 text-(--text-soft)"
                    : "border-white/8 bg-white/3 text-(--text-secondary) hover:bg-white/6 hover:text-(--text-soft)",
                ].join(" ")}
              >
                {isActive ? (
                  <HugeiconsIcon
                    icon={CheckmarkCircle01Icon}
                    size={12}
                    strokeWidth={1.8}
                    className="shrink-0 text-(--brand)"
                  />
                ) : (
                  <HugeiconsIcon
                    icon={Folder01Icon}
                    size={12}
                    strokeWidth={1.6}
                    className="shrink-0"
                  />
                )}
                <span className="whitespace-nowrap">{workspace.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MobileWorkspaceSkeleton() {
  return (
    <div className="flex gap-1.5 overflow-hidden px-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-8 shrink-0 animate-pulse rounded-lg bg-white/8"
          style={{ width: `${100 + i * 20}px` }}
        />
      ))}
    </div>
  );
}
