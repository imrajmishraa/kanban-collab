import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  ArrowDown01Icon,
  Cancel01Icon,
  UnfoldMoreIcon,
  SlackIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";

import { Avatar } from "@/components/board/BoardAvatar";

import { useNewWorkspaceDialog } from "@/components/dashboard/workspace/create/newWorkspaceDialog.context";
import { avatarColor } from "@/features/boards";
import { useActiveWorkspace } from "@/stores/activeWorkspace";
import { cn } from "@/utils/cn";

interface WorkspaceItem {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

interface MobileWorkspaceSwitchProps {
  workspaces: ReadonlyArray<WorkspaceItem>;
  activeWorkspaceId: string | null;
  onWorkspaceChange: (id: string) => void;
  /** Called after picking, so the panel can close behind it. */
  onNavigate?: () => void;
}

/** The same avatar the rail puts on its overview row. */
function WorkspaceAvatar({
  workspace,
  size,
  className,
}: {
  workspace: WorkspaceItem;
  size: number;
  className?: string;
}) {
  /* No workspace at all — the picker's "All workspaces" state, which is about
     choosing between workspaces rather than being inside one. */
  if (!workspace.id) {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center text-(--text-secondary)",
          className,
        )}
      >
        <HugeiconsIcon
          icon={SlackIcon}
          size={16}
          strokeWidth={1.8}
          className="rotate-90"
          aria-hidden="true"
        />
      </span>
    );
  }

  if (!workspace.avatarUrl) {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center text-(--text-muted)",
          className,
        )}
      >
        <HugeiconsIcon icon={SlackIcon} size={16} strokeWidth={1.5} />
      </span>
    );
  }

  return (
    <span
      className={cn("flex shrink-0 items-center justify-center", className)}
    >
      <Avatar
        member={{
          id: workspace.id,
          name: workspace.name,
          avatarUrl: workspace.avatarUrl,
          color: avatarColor(workspace.id),
        }}
        size={size}
        ring={false}
      />
    </span>
  );
}

/** One row's link half: avatar and name, filled while it is the current one. */
function WorkspaceLink({
  workspace,
  active,
  onPick,
}: {
  workspace: WorkspaceItem;
  active: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onPick}
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-left",
        "transition-colors duration-150",
        active ? "bg-(--tint-4)" : "hover:bg-(--tint-6)",
      )}
    >
      <WorkspaceAvatar workspace={workspace} size={20} />

      <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-(--text-primary)">
        {workspace.name}
      </span>
    </button>
  );
}

/**
 * The row's other half: its own control, not a corner of the link. Sitting
 * inside the link is what made it overflow — two targets cannot share one
 * button.
 */
function ClearWorkspaceButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Clear selected workspace"
      className="
        flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md
        bg-(--bg-root) text-(--text-primary) transition-colors duration-150
        hover:bg-(--bg-hover)
      "
    >
      <HugeiconsIcon
        icon={Cancel01Icon}
        size={18}
        strokeWidth={2}
        aria-hidden="true"
      />
    </button>
  );
}

/**
 * The workspace picker: the closed control is a split button (name opens the
 * workspace, chevron opens the list), and the list is a searchable card that
 * grows over it — the same `SidebarSearch` transition, `width` / `opacity` on
 * one 300ms ease-out and the body unrolling on `max-height`.
 *
 * Inside: a find field, the workspaces with their avatar, a tick on the current
 * one that turns into a clear button on hover, and a Create project row.
 */
export default function MobileWorkspaceSwitch({
  workspaces,
  activeWorkspaceId,
  onWorkspaceChange,
  onNavigate,
}: MobileWorkspaceSwitchProps) {
  const navigate = useNavigate();
  const { clearActiveWorkspace } = useActiveWorkspace();
  const { open: openNewWorkspace } = useNewWorkspaceDialog();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = activeWorkspaceId
    ? workspaces.find((workspace) => workspace.id === activeWorkspaceId)
    : undefined;

  const label = current?.name ?? "All workspaces";

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return workspaces;

    return workspaces.filter((workspace) =>
      workspace.name.toLowerCase().includes(needle),
    );
  }, [workspaces, query]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  useEffect(() => {
    if (!open) return;

    /* The field is the point of the card, so it takes the caret. */
    inputRef.current?.focus();

    const onDown = (event: MouseEvent) => {
      if (wrapRef.current?.contains(event.target as Node)) return;
      close();
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (workspace: WorkspaceItem) => {
    close();
    onWorkspaceChange(workspace.id);
    onNavigate?.();
    navigate(`/workspaces/${workspace.id}`);
  };

  /**
   * Clearing also leaves the scoped route. Staying on `/workspaces/:id` lets the
   * route-driven sync (`WorkspaceScope`) put the workspace straight back into
   * the store, which is why the selection looked like it never cleared.
   */
  const clearWorkspace = () => {
    close();
    clearActiveWorkspace();
    onNavigate?.();
    navigate("/workspaces", { replace: true });
  };

  return (
    <div ref={wrapRef} className="relative w-full">
      {/* The resting control. Hidden while the card is open — the card sits on
          top of it, so the box looks like the thing that grew. */}
      {current ? (
        <div
          className={cn(
            "flex w-full items-stretch overflow-hidden rounded-lg border border-(--hairline)",
            "transition-opacity duration-200",
            open ? "pointer-events-none opacity-0" : "opacity-100",
          )}
        >
          <Link
            to={`/workspaces/${current.id}`}
            onClick={onNavigate}
            className="
              flex min-w-0 flex-1 cursor-pointer items-center gap-2 px-2.5 py-2
              text-left transition-colors duration-150 hover:bg-(--tint-6)
            "
          >
            <WorkspaceAvatar workspace={current} size={18} />

            <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-(--text-primary)">
              {current.name}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-haspopup="dialog"
            aria-label="Switch workspace"
            className="
              flex cursor-pointer items-center border-l border-(--hairline) px-2
              text-(--text-secondary) transition-colors duration-150
              hover:bg-(--tint-6) hover:text-(--text-primary)
            "
          >
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              size={14}
              strokeWidth={2}
              aria-hidden="true"
            />
          </button>
        </div>
      ) : (
        /* Nothing selected: one box, no divider, and the tap opens the list
           instead of leaving the panel. */
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label="Choose a workspace"
          className={cn(
            "flex w-full cursor-pointer items-center gap-2 rounded-lg border",
            "border-(--hairline) px-2.5 py-2 text-left",
            "transition-[opacity,background-color] duration-200",
            open
              ? "pointer-events-none opacity-0"
              : "bg-(--bg-hover) opacity-100 hover:bg-(--tint-8)",
          )}
        >
          <WorkspaceAvatar workspace={{ id: "", name: label }} size={18} />

          <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-(--text-primary)">
            {label}
          </span>

          <HugeiconsIcon
            icon={UnfoldMoreIcon}
            size={14}
            strokeWidth={2}
            aria-hidden="true"
            className="shrink-0 text-(--text-secondary)"
          />
        </button>
      )}

      {/* Always mounted, so the card can transition. Anchored to the right edge
          of the slot so it opens over the row instead of off-screen. */}
      <div
        role="dialog"
        aria-label="Workspaces"
        aria-hidden={!open}
        inert={!open}
        className={cn(
          "absolute top-0 right-0 z-50 overflow-hidden border bg-(--bg-root)",
          "shadow-[0_18px_50px_-12px_rgba(0,0,0,0.28)]",
          "transition-[width,border-radius,opacity] duration-300 ease-out",
          "motion-reduce:transition-none",
          open
            ? "w-[min(20rem,calc(100vw-2rem))] rounded-xl border-(--hairline-strong) opacity-100"
            : "pointer-events-none w-[calc(100%-1.5rem)] rounded-lg border-(--hairline-strong) opacity-0",
        )}
      >
        {/* Find, at the top of the card — the same field the docs panel opens
            with. No Esc key on a phone, so the way out is a cross in the same
            cell. */}
        <div
          className={cn(
            "flex items-center gap-2 border-b border-(--hairline)",
            "transition-[height,padding] duration-300 ease-out motion-reduce:transition-none",
            open ? "h-12 px-3" : "h-9 px-2",
          )}
        >
          <HugeiconsIcon
            icon={Search01Icon}
            size={14}
            strokeWidth={1.7}
            className="shrink-0 text-(--text-muted)"
          />

          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find project…"
            aria-label="Find project"
            className="min-w-0 flex-1 bg-transparent text-[12.5px] tracking-tight text-(--text-primary) placeholder:text-(--text-subtle) outline-hidden"
          />

          <button
            type="button"
            onClick={close}
            aria-label="Close workspace list"
            className="
              flex shrink-0 cursor-pointer items-center justify-center rounded
              border border-(--hairline) bg-(--bg-root) px-1.5 py-0.5
              text-(--text-secondary) transition-colors duration-150
              hover:border-(--hairline-strong) hover:text-(--text-primary)
            "
          >
            <HugeiconsIcon icon={Cancel01Icon} size={12} strokeWidth={2} />
          </button>
        </div>

        {/* The body unrolls; the list inside it scrolls on its own, so a long
            list never pushes Create project out of the card. */}
        <div
          className={cn(
            "overflow-hidden transition-[max-height,opacity] duration-300 ease-out",
            "motion-reduce:transition-none",
            open ? "max-h-120 opacity-100" : "max-h-0 opacity-0",
          )}
        >
          {/* `gap-1` keeps two filled rows from touching — the active row and a
              hovered neighbour were reading as one block. */}
          <div className="flex max-h-56 flex-col gap-1 overflow-y-auto overscroll-contain p-1.5">
            {rows.length === 0 ? (
              <p className="px-2 py-4 text-center text-[11.5px] text-(--text-muted)">
                {query.trim()
                  ? `Nothing matches “${query.trim()}”`
                  : "No workspaces yet"}
              </p>
            ) : (
              rows.map((workspace) => {
                const isActive = workspace.id === activeWorkspaceId;

                return (
                  /* Two sibling components, not one button with a corner: the
                     link and the cross are separate targets. */
                  <div
                    key={workspace.id}
                    role="none"
                    /* The row's own background, so the two halves never sit on
                       the same surface: the link fills, the cross does not. */
                    className="flex items-center gap-1 bg-(--bg-root)"
                  >
                    <WorkspaceLink
                      workspace={workspace}
                      active={isActive}
                      onPick={() => pick(workspace)}
                    />

                    {isActive ? (
                      <ClearWorkspaceButton onClick={clearWorkspace} />
                    ) : null}
                  </div>
                );
              })
            )}
          </div>

          {/* The card's footer, above the hairline like the reference. Outside
              the scroller above, so it stays put. */}
          <div className="border-t border-(--hairline) p-1.5">
            <button
              type="button"
              onClick={() => {
                close();
                onNavigate?.();
                openNewWorkspace();
              }}
              className="
                flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2
                text-left text-[12.5px] text-(--text-secondary)
                transition-colors duration-150 hover:bg-(--tint-6) hover:text-(--text-primary)
              "
            >
              <HugeiconsIcon
                icon={Add01Icon}
                size={16}
                strokeWidth={1.8}
                aria-hidden="true"
                className="shrink-0"
              />
              Create project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
