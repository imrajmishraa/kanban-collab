import { useState } from "react";
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
import { useStarredWorkspaces } from "@/stores/starredWorkspaces";
import { useWorkspaceSwitcher } from "@/stores/workspaceSwitcher";
import { toastSuccess } from "@/lib/toast";

import type { DashboardWorkspace } from "@/types/dashboard/dashboard";

interface WorkspaceSectionProps {
  workspaces: DashboardWorkspace[];
}

/** How many cards fit before "View all" has anything to do. */
const COLLAPSED_COUNT = 4;

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
 * The find field is a trigger, not an input: it opens the navbar's workspace
 * switcher, which is the one place that searches workspaces through the API.
 * This grid stays a summary of the dashboard payload, with "View all" to
 * expand it.
 */
export default function WorkspaceSection({
  workspaces,
}: WorkspaceSectionProps) {
  const navigate = useNavigate();

  const [expanded, setExpanded] = useState(false);
  const [addMemberFor, setAddMemberFor] = useState<string | null>(null);
  const [renameFor, setRenameFor] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const starredIds = useStarredWorkspaces((state) => state.ids);
  const toggleStar = useStarredWorkspaces((state) => state.toggle);

  /* The Find workspace button hands off to the navbar switcher, which owns
     searching and shows the avatars. */
  const requestSwitcher = useWorkspaceSwitcher((state) => state.requestOpen);

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
          className="shrink-0 text-(--text-subtle)"
        />
        <p className="min-w-0 truncate text-[12px] text-(--text-secondary)">
          <span className="font-medium tabular-nums text-(--accent)">
            {workspace.activeTaskCount}
          </span>{" "}
          active {workspace.activeTaskCount === 1 ? "task" : "tasks"}
        </p>
      </div>
    ),
  }));

  const cards = dashboardCards;
  const visible = expanded ? cards : cards.slice(0, COLLAPSED_COUNT);
  const hasMore = cards.length > COLLAPSED_COUNT;

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
        <h2 className="text-[13px] font-medium tracking-tight text-(--text-primary)">
          Your workspaces
        </h2>

        <div className="flex items-center gap-2">
          {/* Not an input: pressing it opens the navbar's workspace switcher,
              which searches the API and shows avatars. */}
          <button
            type="button"
            onClick={requestSwitcher}
            className="flex h-7 cursor-pointer items-center gap-1.5 rounded-md border border-(--hairline) bg-(--tint-3) px-2 text-(--text-muted) transition-colors duration-200 hover:border-(--hairline-strong) hover:bg-(--bg-hover) hover:text-(--text-soft)"
          >
            <HugeiconsIcon
              icon={Search01Icon}
              size={12}
              strokeWidth={1.6}
              className="shrink-0"
            />

            <span className="text-[11.5px] tracking-tight">Find workspace</span>
          </button>

          {hasMore && (
            <button
              type="button"
              onClick={() => setExpanded((previous) => !previous)}
              className="group/all flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-(--text-muted) transition-colors duration-200 hover:bg-(--bg-hover) hover:text-(--text-primary)"
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

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-(--hairline-strong) px-5 py-10 text-center">
          <p className="text-[12.5px] text-(--text-secondary)">
            No workspaces yet, create one to get{" "}
            <span className="font-medium capitalize text-(--accent)">
              started
            </span>
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
