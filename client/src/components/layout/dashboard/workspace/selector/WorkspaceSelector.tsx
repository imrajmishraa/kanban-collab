import { useCallback, useEffect, useRef, useState } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  ChevronsLeftRightIcon,
  Cancel01Icon,
  Search01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";

import { Tooltip } from "#components/Tooltips/ToolTip";

import { useWorkspaces } from "@/hooks/dashboard/useWorkspaces";
import { useNewWorkspaceDialog } from "@/components/layout/dashboard/workspace/create/newWorkspaceDialog.context";
import { useWorkspaceSwitcher } from "@/stores/workspaceSwitcher";

const SEARCH_DEBOUNCE_MS = 300;

/** The minimum a row needs to render, so any workspace shape fits. */
interface PickerItem {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

interface WorkspaceSelectorProps {
  activeWorkspaceId: string | null;
  activeWorkspaceName: string | null;
  onWorkspaceChange: (id: string, name: string) => void;
  /** Clicking the name goes straight to that workspace page. */
  onOpenActive?: () => void;
  /** The close button leaves the workspace and returns to the overview. */
  onClose?: () => void;
  /**
   * Optional pre-loaded list. When given, the component renders it instead of
   * fetching, which lets a caller that already holds workspaces (the dashboard
   * summary, the mobile sidebar) reuse this switcher. Structural type on
   * purpose: `Workspace` and `DashboardWorkspace` both satisfy it.
   */
  workspaces?: ReadonlyArray<PickerItem>;
  /**
   * Render one pill instead of the split cluster. Used on the overview, where
   * there is no single workspace to open and nothing to close, so the extra
   * targets would be dead weight.
   */
  unified?: boolean;
  triggerClassName?: string;
  dropdownClassName?: string;
}

/**
 * Workspace tile: the uploaded avatar when there is one, else the monogram.
 * Matches the cards on the overview, so the same workspace looks the same in
 * both places.
 */
function WorkspaceAvatar({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl?: string | null;
}) {
  const [failed, setFailed] = useState(false);
  const initial = name.trim().charAt(0).toUpperCase() || "W";

  const className =
    "flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-md border border-orange-50/15 bg-white/6 text-[10px] font-semibold text-neutral-300";

  if (imageUrl && !failed) {
    return (
      <span className={className}>
        <img
          src={imageUrl}
          alt=""
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      </span>
    );
  }

  return (
    <span aria-hidden="true" className={className}>
      {initial}
    </span>
  );
}

/**
 * Workspace switcher: trigger, filter field, list with the active row ticked,
 * and a create row.
 *
 * The filter input used to be missing entirely: `searchInput` was tracked and
 * debounced but never rendered, so the list could only ever show page one of
 * everything.
 */
export function WorkspaceSelector({
  activeWorkspaceId,
  activeWorkspaceName,
  onWorkspaceChange,
  onOpenActive,
  onClose,
  workspaces: providedWorkspaces,
  unified = false,
  triggerClassName,
  dropdownClassName,
}: WorkspaceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { open: openNewWorkspace } = useNewWorkspaceDialog();

  /* Any surface can ask for this dropdown; the counter makes repeated asks
     work. Adjusted during render, which the React Compiler allows, rather than
     in an effect. */
  const openRequests = useWorkspaceSwitcher((state) => state.openRequests);
  const [seenRequests, setSeenRequests] = useState(openRequests);

  if (openRequests !== seenRequests) {
    setSeenRequests(openRequests);
    if (!isOpen) setIsOpen(true);
  }

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearch(searchInput.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetched = useWorkspaces(debouncedSearch);

  /* Hooks must run unconditionally, so the query still runs; its result is
     simply ignored when the caller supplied a list. */
  const workspaces: ReadonlyArray<PickerItem> = providedWorkspaces
    ? providedWorkspaces.filter((workspace) =>
        debouncedSearch.length === 0
          ? true
          : workspace.name
              .toLowerCase()
              .includes(debouncedSearch.toLowerCase()),
      )
    : fetched.workspaces;

  /* Avatar lookup, so the trigger and every row can show the uploaded image
     instead of a letter. */
  const avatarById = new Map<string, string | null>(
    (providedWorkspaces ?? fetched.workspaces).map((workspace) => [
      workspace.id,
      workspace.avatarUrl ?? null,
    ]),
  );

  const isLoading = providedWorkspaces ? false : fetched.isLoading;
  const isError = providedWorkspaces ? false : fetched.isError;
  const isFetchingNextPage = providedWorkspaces
    ? false
    : fetched.isFetchingNextPage;
  const hasNextPage = providedWorkspaces ? false : fetched.hasNextPage;
  const fetchNextPage = fetched.fetchNextPage;

  /* Fall back to the list for the trigger label when no name was passed. */
  const resolvedActiveName =
    activeWorkspaceName ??
    workspaces.find((workspace) => workspace.id === activeWorkspaceId)?.name ??
    null;

  const toggleOpen = () => {
    setIsOpen((previous) => {
      if (!previous) {
        setSearchInput("");
        setDebouncedSearch("");
      }
      return !previous;
    });
  };

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return;
      setIsOpen(false);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const handleSelect = useCallback(
    (workspace: PickerItem) => {
      onWorkspaceChange(workspace.id, workspace.name);
      setIsOpen(false);
    },
    [onWorkspaceChange],
  );

  const handleScroll = useCallback(() => {
    const element = listRef.current;
    if (!element || !hasNextPage || isFetchingNextPage) return;

    const nearBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight < 80;

    if (nearBottom) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div ref={containerRef} className="relative">
      {/* Overview: a single pill that opens the list.
          Workspace: icon + name (opens the workspace), a square chevron that
          opens the list, and a close button that only appears on hover or
          keyboard focus so it does not clutter the header. */}
      {unified ? (
        <button
          type="button"
          onClick={toggleOpen}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={[
            "flex h-7 cursor-pointer items-center gap-2 rounded-lg px-2.5",
            "text-[11.5px] tracking-tight",
            "transition-colors duration-200",
            isOpen
              ? "bg-white/10 text-neutral-100"
              : "bg-white/6 text-neutral-300 hover:bg-white/9 hover:text-neutral-100",
            triggerClassName,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {activeWorkspaceId && (
            <WorkspaceAvatar
              name={resolvedActiveName ?? "Workspace"}
              imageUrl={avatarById.get(activeWorkspaceId) ?? null}
            />
          )}

          <span className="max-w-40 truncate">
            {resolvedActiveName ?? "All Workspaces"}
          </span>

          <HugeiconsIcon
            icon={ChevronsLeftRightIcon}
            size={11}
            strokeWidth={2}
            className={[
              "shrink-0 text-neutral-400 rotate-90 transition-transform duration-200",
              isOpen && "",
            ].join(" ")}
          />
        </button>
      ) : (
        <div className="group/ws flex items-center gap-1">
          <button
            type="button"
            onClick={onOpenActive}
            disabled={!onOpenActive}
            className={[
              "flex h-7 cursor-pointer items-center gap-2 rounded-md px-2",
              "text-[11.5px] tracking-tight",
              "transition-colors duration-200",
              "text-neutral-300 hover:bg-white/6 hover:text-neutral-100",
              "disabled:cursor-default disabled:hover:bg-transparent",
              triggerClassName,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <WorkspaceAvatar
              name={resolvedActiveName ?? "Workspace"}
              imageUrl={
                activeWorkspaceId
                  ? (avatarById.get(activeWorkspaceId) ?? null)
                  : null
              }
            />

            <span className="max-w-32 truncate">
              {resolvedActiveName ?? "Select workspace"}
            </span>
          </button>

          <button
            type="button"
            onClick={toggleOpen}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-label="Switch workspace"
            className={[
              "flex size-6 cursor-pointer items-center justify-center rounded-md",
              "transition-colors duration-200",
              isOpen
                ? "bg-white/10 text-neutral-100"
                : "bg-white/5 text-neutral-400 hover:bg-white/8 hover:text-neutral-100",
            ].join(" ")}
          >
            <HugeiconsIcon
              icon={ChevronsLeftRightIcon}
              size={11}
              strokeWidth={2}
              className={[
                "shrink-0 transition-transform rotate-90 duration-200",
                isOpen && "",
              ].join(" ")}
            />
          </button>

          {onClose && (
            /* Revealed on hover (or keyboard focus) rather than always on: the
               cluster reads as one control until you go looking for the way
               out. It is still rendered on every route inside a workspace. */
            <div className="flex items-center opacity-0 transition-opacity duration-200 group-hover/ws:opacity-100 focus-within:opacity-100">
              <span
                aria-hidden="true"
                className="mx-0.5 h-4 w-px bg-orange-50/15"
              />

              <Tooltip
                label="Back to project view"
                side="bottom"
                shape="solid"
                size="sm"
              >
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Back to project view"
                  className="flex size-6 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors duration-200 hover:bg-white/6 hover:text-neutral-200"
                >
                  <HugeiconsIcon
                    icon={Cancel01Icon}
                    size={12}
                    strokeWidth={2}
                  />
                </button>
              </Tooltip>
            </div>
          )}
        </div>
      )}

      {isOpen && (
        <div
          role="listbox"
          aria-label="Select workspace"
          className={[
            "absolute left-0 top-full z-50 mt-1.5 flex flex-col overflow-hidden rounded-xl",
            "border border-orange-50/15 bg-[#141416]",
            "max-h-[min(360px,calc(100vh-8rem))]",
            dropdownClassName ?? "w-72",
          ].join(" ")}
        >
          {/* Filter */}
          <div className="flex shrink-0 items-center gap-2 border-b border-orange-50/10 px-3 py-2">
            <HugeiconsIcon
              icon={Search01Icon}
              size={14}
              strokeWidth={1.6}
              className="shrink-0 text-neutral-600"
            />

            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Find workspace"
              autoFocus
              className="
                min-w-0 flex-1 bg-transparent
                text-[12.5px] tracking-tight text-neutral-100
                placeholder:text-neutral-600
                outline-hidden ring-0 focus:outline-hidden focus:ring-0
                focus-visible:outline-hidden
              "
            />

            <kbd className="shrink-0 rounded border border-orange-50/15 bg-white/6 px-1 py-0.5 font-mono text-[9px] text-neutral-500">
              Esc
            </kbd>
          </div>

          {/* List */}
          <div
            ref={listRef}
            onScroll={handleScroll}
            className="min-h-0 flex-1 overflow-y-auto p-1"
          >
            {isError ? (
              <p className="px-2 py-2 text-[12px] text-rose-300">
                Unable to load workspaces.
              </p>
            ) : isLoading ? (
              <WorkspaceSkeleton />
            ) : workspaces.length === 0 ? (
              <p className="px-2 py-3 text-center text-[12px] text-neutral-500">
                {debouncedSearch
                  ? `No matches for “${debouncedSearch}”`
                  : "No workspaces yet"}
              </p>
            ) : (
              <>
                {workspaces.map((workspace) => {
                  const isActive = workspace.id === activeWorkspaceId;

                  return (
                    <button
                      key={workspace.id}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => handleSelect(workspace)}
                      className={[
                        "flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-md px-2",
                        "text-left text-[12.5px] tracking-tight",
                        "transition-colors duration-200",
                        isActive
                          ? "bg-white/[0.07] text-neutral-100"
                          : "text-neutral-300 hover:bg-white/5 hover:text-neutral-100",
                      ].join(" ")}
                    >
                      <WorkspaceAvatar
                        name={workspace.name}
                        imageUrl={workspace.avatarUrl ?? null}
                      />

                      <span className="min-w-0 flex-1 truncate">
                        {workspace.name}
                      </span>

                      {isActive && (
                        <HugeiconsIcon
                          icon={Tick02Icon}
                          size={13}
                          strokeWidth={2}
                          className="shrink-0 text-orange-100"
                        />
                      )}
                    </button>
                  );
                })}

                {isFetchingNextPage && (
                  <div className="flex h-8 items-center justify-center">
                    <span className="font-mono text-[9px] text-neutral-600">
                      Loading…
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Create */}
          <div className="shrink-0 border-t border-orange-50/10 p-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                openNewWorkspace();
              }}
              className="flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-md px-2 text-left text-[12.5px] tracking-tight text-neutral-300 transition-colors duration-200 hover:bg-white/5 hover:text-neutral-100"
            >
              <HugeiconsIcon
                icon={Add01Icon}
                size={14}
                strokeWidth={2}
                className="shrink-0 text-neutral-500"
              />
              Create workspace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function WorkspaceSkeleton() {
  return (
    <div className="space-y-0.5">
      {[1, 2, 3, 4].map((row) => (
        <div
          key={row}
          className="flex h-8 items-center gap-2.5 rounded-md px-2"
        >
          <div className="size-5 shrink-0 animate-pulse rounded-md bg-white/6" />
          <div
            className={[
              "h-2.5 animate-pulse rounded bg-white/6",
              row === 1
                ? "w-24"
                : row === 2
                  ? "w-20"
                  : row === 3
                    ? "w-22"
                    : "w-16",
            ].join(" ")}
          />
        </div>
      ))}
    </div>
  );
}
