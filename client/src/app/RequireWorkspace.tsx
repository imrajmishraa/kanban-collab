import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Folder01Icon,
  KanbanIcon,
  Note01Icon,
  Search01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

import { useNewWorkspaceDialog } from "@/components/layout/dashboard/workspace/create/newWorkspaceDialog.context";
import { useWorkspaces } from "@/hooks/dashboard/useWorkspaces";
import { useActiveWorkspace } from "@/stores/activeWorkspace";

/** What the blocked page is called, and the glyph that represents it. */
const DESTINATIONS: Record<string, { label: string; icon: typeof KanbanIcon }> =
  {
    "/boards": { label: "Boards", icon: KanbanIcon },
    "/members": { label: "Members", icon: UserGroupIcon },
    "/notes": { label: "Notes", icon: Note01Icon },
  };

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Gate for pages that only make sense inside a workspace.
 *
 * Boards, members and notes all read the active workspace, so landing on one
 * with nothing selected used to render an empty shell with no way forward.
 * This asks for a workspace first, then renders the page the user asked for.
 */
export function RequireWorkspace({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { activeWorkspaceId, setActiveWorkspace } = useActiveWorkspace();
  const { open: openNewWorkspace } = useNewWorkspaceDialog();

  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timer = setTimeout(
      () => setDebounced(search.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [search]);

  const { workspaces, isLoading } = useWorkspaces(debounced);

  if (activeWorkspaceId) return <>{children}</>;

  const destination = DESTINATIONS[pathname] ?? {
    label: "Continue",
    icon: Folder01Icon,
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-5 py-12 text-(--text-primary)">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-9 items-center justify-center rounded-lg border border-orange-50/15 bg-white/3 text-neutral-400">
            <HugeiconsIcon
              icon={destination.icon}
              size={16}
              strokeWidth={1.7}
            />
          </span>

          <h1 className="mt-4 text-[14px] font-medium tracking-tight text-neutral-100">
            Continue to {destination.label}
          </h1>

          <p className="mt-1 text-[12px] text-neutral-500">
            Choose a workspace to continue
          </p>
        </div>

        <div className="mt-6 space-y-1">
          <div className="flex h-9 items-center gap-2 rounded-lg border border-orange-50/15 bg-white/3 px-3 transition-colors duration-200 focus-within:border-orange-50/30">
            <HugeiconsIcon
              icon={Search01Icon}
              size={13}
              strokeWidth={1.6}
              className="shrink-0 text-neutral-600"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Find workspace"
              aria-label="Find workspace"
              className="min-w-0 flex-1 bg-transparent text-[12.5px] tracking-tight text-neutral-100 placeholder:text-neutral-600 outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none"
            />
          </div>

          {isLoading ? (
            <div className="space-y-1 pt-1">
              {[0, 1, 2].map((row) => (
                <div
                  key={row}
                  className="h-9 animate-pulse rounded-lg bg-white/4"
                />
              ))}
            </div>
          ) : workspaces.length === 0 ? (
            <p className="px-2 py-6 text-center text-[12px] text-neutral-500">
              {debounced
                ? `No workspaces match “${debounced}”`
                : "You are not in a workspace yet"}
            </p>
          ) : (
            <ul className="max-h-64 overflow-y-auto pt-1">
              {workspaces.map((workspace) => (
                <li key={workspace.id}>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveWorkspace(workspace.id, workspace.name)
                    }
                    className="flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-left transition-colors duration-200 hover:bg-white/5"
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-md border border-orange-50/15 text-neutral-500">
                      <HugeiconsIcon
                        icon={Folder01Icon}
                        size={11}
                        strokeWidth={1.7}
                      />
                    </span>

                    <span className="min-w-0 flex-1 truncate text-[12.5px] text-neutral-200">
                      {workspace.name}
                    </span>

                    <span className="shrink-0 font-mono text-[10px] tabular-nums text-neutral-600">
                      {workspace.members.length}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            onClick={openNewWorkspace}
            className="flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-left text-[12.5px] text-neutral-300 transition-colors duration-200 hover:bg-white/5 hover:text-neutral-100"
          >
            <HugeiconsIcon
              icon={Add01Icon}
              size={13}
              strokeWidth={2}
              className="shrink-0 text-neutral-500"
            />
            Create workspace
          </button>
        </div>
      </div>
    </div>
  );
}
