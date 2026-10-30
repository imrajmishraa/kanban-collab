import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  ArrowRight01Icon,
  Folder01Icon,
  KanbanIcon,
  LogsIcon,
  Note01Icon,
  Search01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

import { Avatar } from "@components/layout/board/BoardAvatar";

import { useNewWorkspaceDialog } from "@/components/layout/dashboard/workspace/create/newWorkspaceDialog.context";
import { avatarColor } from "@/features/boards/board.helpers";
import { useWorkspaces } from "@/hooks/dashboard/useWorkspaces";
import { useActiveWorkspace } from "@/stores/activeWorkspace";

/** What the blocked page is called, and the glyph that represents it. */
const DESTINATIONS: Record<string, { label: string; icon: typeof KanbanIcon }> =
  {
    boards: { label: "Boards", icon: KanbanIcon },
    members: { label: "Members", icon: UserGroupIcon },
    notes: { label: "Notes", icon: Note01Icon },
    activity: { label: "Activity", icon: LogsIcon },
  };

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Gate for the old, unscoped paths.
 *
 * `/boards` and its siblings predate workspace-scoped routes. They still work:
 * with a workspace selected they forward straight to the scoped path, and with
 * nothing selected they ask for a workspace first, then forward. The suffix in
 * `to` is the part that follows the workspace id.
 */
export function RequireWorkspace({ to }: { to: string }) {
  const navigate = useNavigate();
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

  if (activeWorkspaceId) {
    return <Navigate to={`/workspaces/${activeWorkspaceId}${to}`} replace />;
  }

  const head = to.split("?")[0]?.split("/")[1] ?? "";
  const destination = DESTINATIONS[head] ?? {
    label: "Continue",
    icon: Folder01Icon,
  };

  const choose = (workspaceId: string, name: string) => {
    setActiveWorkspace(workspaceId, name);
    navigate(`/workspaces/${workspaceId}${to}`, { replace: true });
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-5 py-12 text-(--text-primary)">
      <div className="w-full max-w-85">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-10 items-center justify-center rounded-xl border border-(--hairline) bg-(--tint-3) text-(--accent)">
            <HugeiconsIcon
              icon={destination.icon}
              size={17}
              strokeWidth={1.7}
            />
          </span>

          <h1 className="mt-4 text-[15px] font-medium tracking-tight text-(--text-primary)">
            Continue to {destination.label}
          </h1>

          <p className="mt-1.5 max-w-65 text-[12.5px] leading-5 text-(--text-muted)">
            Pick a{" "}
            <span className="font-medium capitalize text-(--accent)">
              workspace
            </span>{" "}
            and you will land straight on {destination.label.toLowerCase()}
          </p>
        </div>

        <div className="mt-6">
          <div className="flex h-9 items-center gap-2 rounded-lg border border-(--hairline) bg-(--tint-3) px-3 transition-colors duration-200 focus-within:border-(--hairline-strong)">
            <HugeiconsIcon
              icon={Search01Icon}
              size={13}
              strokeWidth={1.6}
              className="shrink-0 text-(--text-subtle)"
            />

            <input
              type="text"
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Find workspace"
              aria-label="Find workspace"
              className="min-w-0 flex-1 bg-transparent text-[12.5px] tracking-tight text-(--text-primary) placeholder:text-(--text-subtle) outline-hidden ring-0 focus:outline-hidden focus:ring-0 focus-visible:outline-hidden"
            />
          </div>

          {isLoading ? (
            <div className="mt-1 space-y-1">
              {[0, 1, 2].map((row) => (
                <div
                  key={row}
                  className="h-10 animate-pulse rounded-lg bg-(--tint-4)"
                />
              ))}
            </div>
          ) : workspaces.length === 0 ? (
            <p className="px-2 py-8 text-center text-[12px] text-(--text-muted)">
              {debounced
                ? `No workspaces match “${debounced}”`
                : "You are not in a workspace yet"}
            </p>
          ) : (
            <ul className="mt-1 max-h-64 overflow-y-auto">
              {workspaces.map((workspace) => (
                <li key={workspace.id}>
                  <button
                    type="button"
                    onClick={() => choose(workspace.id, workspace.name)}
                    className="group/row flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-left transition-colors duration-200 hover:bg-(--bg-hover)"
                  >
                    {/* The workspace's own image when it has one; the folder
                        glyph only stands in for workspaces without one. */}
                    {workspace.avatarUrl ? (
                      <Avatar
                        member={{
                          id: workspace.id,
                          name: workspace.name,
                          avatarUrl: workspace.avatarUrl,
                          color: avatarColor(workspace.id),
                        }}
                        size={24}
                        ring={false}
                      />
                    ) : (
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-(--hairline) text-(--text-muted) transition-colors duration-200 group-hover/row:text-(--text-soft)">
                        <HugeiconsIcon
                          icon={Folder01Icon}
                          size={12}
                          strokeWidth={1.7}
                        />
                      </span>
                    )}

                    <span className="min-w-0 flex-1 truncate text-[12.5px] text-(--text-primary)">
                      {workspace.name}
                    </span>

                    <span className="shrink-0 font-mono text-[10px] tabular-nums text-(--text-subtle)">
                      {workspace.members.length}
                    </span>

                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={12}
                      strokeWidth={2}
                      className="shrink-0 text-(--text-subtle) opacity-0 transition-all duration-200 group-hover/row:translate-x-0.5 group-hover/row:text-(--accent) group-hover/row:opacity-100"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 border-t border-(--hairline) pt-3">
            <button
              type="button"
              onClick={openNewWorkspace}
              className="flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-none rounded-tr-lg rounded-bl-lg border border-(--hairline-strong) text-[12px] text-(--text-primary) transition-colors duration-200 hover:border-(--hairline-strong) hover:bg-(--tint-4) hover:text-(--text-primary)"
            >
              <HugeiconsIcon icon={Add01Icon} size={13} strokeWidth={2} />
              Create workspace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
