import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  KanbanIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";

import { WorkspaceCard } from "@/components/layout/dashboard/workspace/WorkspaceCard";
import {
  AddMemberDialog,
  EditWorkspaceDialog,
} from "@/features/workspaces/components/workspace-dialogs";
import { useWorkspaces } from "@/hooks/dashboard/useWorkspaces";
import { useStarredWorkspaces } from "@/stores/starredWorkspaces";
import { toastSuccess } from "@/lib/toast";

import type { DashboardWorkspace } from "@/types/dashboard/dashboard";

interface WorkspaceSectionProps {
  workspaces: DashboardWorkspace[];
}

/** How many cards fit before "View all" has anything to do. */
const COLLAPSED_COUNT = 4;
const SEARCH_DEBOUNCE_MS = 300;

/**
 * Reads whichever image key the API may add, without requiring the caller's
 * type to declare one.
 *
 * The parameter is `object` on purpose: a signature listing only optional
 * properties is a "weak type", and TypeScript rejects passing anything that
 * shares none of them, which is exactly what `DashboardWorkspace` and
 * `Workspace` do today.
 */
function imageUrlOf(workspace: object): string | null {
  const source = workspace as {
    imageUrl?: string | null;
    logoUrl?: string | null;
    avatarUrl?: string | null;
  };

  return source.imageUrl ?? source.logoUrl ?? source.avatarUrl ?? null;
}

/**
 * Workspace grid for the overview.
 *
 * The find field queries the API rather than filtering the handful of
 * workspaces the dashboard happens to send: `useWorkspaces` takes the search
 * term, so a workspace that is not in the dashboard payload can still be
 * found. Counts come from the dashboard for the default view, and from the
 * API list (member counts) while searching.
 */
export default function WorkspaceSection({
  workspaces,
}: WorkspaceSectionProps) {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [addMemberFor, setAddMemberFor] = useState<string | null>(null);
  const [renameFor, setRenameFor] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const starredIds = useStarredWorkspaces((state) => state.ids);
  const toggleStar = useStarredWorkspaces((state) => state.toggle);

  useEffect(() => {
    const timer = setTimeout(
      () => setDebounced(search.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [search]);

  const searching = debounced.length > 0;

  const { workspaces: apiWorkspaces, isLoading: isSearching } =
    useWorkspaces(debounced);

  const dashboardCards = workspaces.map((workspace) => ({
    id: workspace.id,
    name: workspace.name,
    imageUrl: imageUrlOf(workspace),
    secondary: `${workspace.boardCount} ${
      workspace.boardCount === 1 ? "board" : "boards"
    }`,
    meta: (
      <div className="flex items-center gap-2">
        <HugeiconsIcon
          icon={KanbanIcon}
          size={13}
          strokeWidth={1.6}
          className="shrink-0 text-neutral-600"
        />
        <p className="min-w-0 truncate text-[12px] text-neutral-400">
          <span className="font-medium tabular-nums text-orange-100">
            {workspace.activeTaskCount}
          </span>{" "}
          active {workspace.activeTaskCount === 1 ? "task" : "tasks"}
        </p>
      </div>
    ),
  }));

  const searchCards = apiWorkspaces.map((workspace) => ({
    id: workspace.id,
    name: workspace.name,
    imageUrl: imageUrlOf(workspace),
    secondary: `${workspace.members.length} ${
      workspace.members.length === 1 ? "member" : "members"
    }`,
    meta: workspace.description?.trim() ? (
      <p className="truncate text-[12px] text-neutral-400">
        {workspace.description}
      </p>
    ) : undefined,
  }));

  const cards = searching ? searchCards : dashboardCards;
  const visible =
    searching || expanded ? cards : cards.slice(0, COLLAPSED_COUNT);
  const hasMore = !searching && cards.length > COLLAPSED_COUNT;

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/workspaces/${id}`;
    void navigator.clipboard
      .writeText(url)
      .then(() => toastSuccess("Link copied", url))
      .catch(() => toastSuccess("Link", url));
  };

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
        <h2 className="text-[13px] font-medium tracking-tight text-neutral-100">
          Your workspaces
        </h2>

        <div className="flex items-center gap-2">
          <div className="flex h-7 items-center gap-1.5 rounded-md border border-orange-50/15 bg-white/3 px-2 transition-colors duration-200 focus-within:border-orange-50/30">
            <HugeiconsIcon
              icon={Search01Icon}
              size={12}
              strokeWidth={1.6}
              className="shrink-0 text-neutral-600"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Find workspace"
              className="w-28 bg-transparent text-[11.5px] tracking-tight text-neutral-100 placeholder:text-neutral-600 outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none sm:w-36"
            />
          </div>

          {hasMore && (
            <button
              type="button"
              onClick={() => setExpanded((previous) => !previous)}
              className="group/all flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-neutral-500 transition-colors duration-200 hover:bg-white/6 hover:text-neutral-200"
            >
              {expanded ? "Show less" : "View all"}
              <HugeiconsIcon
                icon={expanded ? ArrowDown01Icon : ArrowRight01Icon}
                size={11}
                strokeWidth={2}
                className={[
                  "shrink-0 transition-transform duration-200",
                  expanded ? "rotate-180" : "group-hover/all:translate-x-0.5",
                ].join(" ")}
              />
            </button>
          )}
        </div>
      </div>

      {searching && isSearching ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1].map((row) => (
            <div
              key={row}
              className="h-19 animate-pulse rounded-xl border border-orange-50/15 bg-white/3"
            />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-orange-50/20 px-5 py-10 text-center">
          <p className="text-[12.5px] text-neutral-400">
            {searching ? (
              <>No workspaces match “{debounced}”</>
            ) : (
              <>
                No workspaces yet, create one to get{" "}
                <span className="font-medium capitalize text-orange-100">
                  started
                </span>
              </>
            )}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {visible.map((card) => (
            <WorkspaceCard
              key={card.id}
              id={card.id}
              name={card.name}
              imageUrl={card.imageUrl}
              secondary={card.secondary}
              meta={card.meta}
              onClick={() => navigate(`/workspaces/${card.id}`)}
              onRename={() => setRenameFor({ id: card.id, name: card.name })}
              onToggleStar={() => toggleStar(card.id)}
              isStarred={starredIds.includes(card.id)}
              onAddMember={() => setAddMemberFor(card.id)}
              onCopyLink={() => copyLink(card.id)}
            />
          ))}
        </div>
      )}

      {addMemberFor && (
        <AddMemberDialog
          workspaceId={addMemberFor}
          onClose={() => setAddMemberFor(null)}
        />
      )}

      {renameFor && (
        <EditWorkspaceDialog
          workspaceId={renameFor.id}
          currentName={renameFor.name}
          onClose={() => setRenameFor(null)}
        />
      )}
    </section>
  );
}
