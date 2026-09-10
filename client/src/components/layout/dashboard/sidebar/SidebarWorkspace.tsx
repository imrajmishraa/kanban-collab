import { useEffect, useRef, useState } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  Briefcase01Icon,
  CheckmarkCircle01Icon,
  KanbanIcon,
} from "@hugeicons/core-free-icons";

import type { Workspace } from "@/types/api/dashboard/workspace";

interface SidebarWorkspaceProps {
  collapsed: boolean;
  mobile?: boolean;
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  onWorkspaceChange: (workspaceId: string) => void;
  isLoading: boolean;
  isError: boolean;
}

const SidebarWorkspace = ({
  collapsed,
  mobile = false,
  workspaces,
  activeWorkspaceId,
  onWorkspaceChange,
  isLoading,
  isError,
}: SidebarWorkspaceProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isWorkspaceHovered, setIsWorkspaceHovered] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  /*
   * Close dropdown when clicking outside.
   */
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsWorkspaceHovered(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  /*
   * Close dropdown/flyout with Escape.
   */
  useEffect(() => {
    if (!isOpen && !isWorkspaceHovered) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setIsWorkspaceHovered(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isWorkspaceHovered]);

  /*
   * Select workspace.
   */
  const handleWorkspaceChange = (workspaceId: string) => {
    onWorkspaceChange(workspaceId);
    setIsOpen(false);
    setIsWorkspaceHovered(false);
  };

  /*
   * ─────────────────────────────────────────────
   * Collapsed desktop sidebar
   * ─────────────────────────────────────────────
   */
  if (collapsed) {
    const showWorkspaceFlyout = !mobile && isWorkspaceHovered;

    return (
      <div
        className="relative flex justify-center px-2 py-3"
        onMouseEnter={() => {
          if (!mobile) {
            setIsWorkspaceHovered(true);
          }
        }}
        onMouseLeave={() => {
          if (!mobile) {
            setIsWorkspaceHovered(false);
          }
        }}
      >
        {/* Workspace icon */}
        {isLoading ? (
          <div
            className="
              flex size-9 items-center justify-center
              rounded-md
              border border-transparent
            "
          >
            <div className="size-4 animate-pulse rounded bg-(--surface-elevated)" />
          </div>
        ) : (
          <button
            type="button"
            title="Workspaces"
            aria-label="Open workspaces"
            aria-expanded={showWorkspaceFlyout}
            onClick={(event) => {
              event.stopPropagation();
            }}
            className={[
              "group flex size-9 cursor-pointer items-center justify-center",
              "rounded-md border border-transparent",
              "text-(--text-secondary)",
              "transition-all duration-150",
              showWorkspaceFlyout
                ? "border-(--brand) bg-(--brand-muted) text-(--text-primary)"
                : "hover:border-(--brand) hover:bg-(--brand-muted) hover:text-(--text-primary)",
            ].join(" ")}
          >
            <HugeiconsIcon
              icon={Briefcase01Icon}
              size={16}
              strokeWidth={1.5}
            />
          </button>
        )}

        {/* Workspace flyout */}
        {showWorkspaceFlyout && (
          <div
            ref={dropdownRef}
            className="fixed z-100 w-60"
            style={{
              left: "4.5rem",
              top: "4.25rem",
            }}
            onMouseEnter={() => {
              setIsWorkspaceHovered(true);
            }}
            onMouseLeave={() => {
              setIsWorkspaceHovered(false);
            }}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div
              className="
                overflow-hidden
                rounded-lg
                border border-(--border)
                bg-(--bg-surface)
                shadow-[0_12px_30px_rgba(0,0,0,0.45)]
              "
            >
              {/* Header */}
              <div className="border-b border-(--border) px-3 py-2.5">
                <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-(--text-muted)">
                  Workspaces
                </p>
              </div>

              {/* Loading */}
              {isLoading && (
                <div className="space-y-1 px-2 py-2">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="flex min-h-10 items-center gap-2 px-2"
                    >
                      <div className="size-4 shrink-0 animate-pulse rounded bg-(--surface-elevated)" />

                      <div
                        className={[
                          "h-3 animate-pulse rounded bg-(--surface-elevated)",
                          item === 1
                            ? "w-28"
                            : item === 2
                              ? "w-20"
                              : "w-24",
                        ].join(" ")}
                      />
                    </div>
                  ))}

                  <div className="pt-1 text-center">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-(--text-muted)">
                      Loading workspaces
                    </span>
                  </div>
                </div>
              )}

              {/* Error */}
              {isError && !isLoading && (
                <div className="px-3 py-3">
                  <p className="font-mono text-xs text-(--danger)">
                    Unable to load workspaces.
                  </p>
                </div>
              )}

              {/* Empty */}
              {!isLoading && !isError && workspaces.length === 0 && (
                <div className="px-3 py-3">
                  <p className="font-mono text-xs text-(--text-muted)">
                    No workspaces
                  </p>
                </div>
              )}

              {/* Workspace list */}
              {!isLoading && !isError && workspaces.length > 0 && (
                <div className="max-h-64 overflow-y-auto py-1">
                  {workspaces.map((workspace) => {
                    const isActive =
                      workspace.id === activeWorkspaceId;

                    return (
                      <button
                        key={workspace.id}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleWorkspaceChange(workspace.id);
                        }}
                        className={[
                          "group flex min-h-10 w-full cursor-pointer items-center gap-2",
                          "border border-transparent",
                          "px-3 py-2.5",
                          "text-left font-mono text-xs",
                          "transition-all duration-100",
                          isActive
                            ? "border-(--brand) bg-(--brand-muted) text-(--text-primary)"
                            : "text-(--text-secondary) hover:border-(--brand) hover:bg-(--brand-muted) hover:text-(--text-primary)",
                        ].join(" ")}
                      >
                        <span className="flex size-4 shrink-0 items-center justify-center">
                          {isActive && (
                            <HugeiconsIcon
                              icon={CheckmarkCircle01Icon}
                              size={14}
                              strokeWidth={1.5}
                              className="text-(--brand)"
                            />
                          )}
                        </span>

                        <HugeiconsIcon
                          icon={KanbanIcon}
                          size={20}
                          color="currentColor"
                          strokeWidth={1.5}
                        />

                        <span className="min-w-0 flex-1 truncate">
                          {workspace.name}
                        </span>

                        {workspace.status === "deletion_pending" && (
                          <span className="font-mono text-[9px] uppercase tracking-wider text-(--warning)">
                            Pending
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  /*
   * ─────────────────────────────────────────────
   * Loading state
   * ─────────────────────────────────────────────
   */
  if (isLoading) {
    return (
      <section className="px-3 pt-5">
        <p className="mb-2 px-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-(--text-muted)">
          WORKSPACES
        </p>

        <div
          className="
            flex h-9 w-full items-center gap-2 px-2
            rounded-md
            border border-transparent
          "
        >
          <div className="size-3.5 shrink-0 animate-pulse rounded bg-(--surface-elevated)" />

          <div className="h-3 w-28 animate-pulse rounded bg-(--surface-elevated)" />

          <div className="ml-auto size-3 animate-pulse rounded bg-(--surface-elevated)" />
        </div>
      </section>
    );
  }

  /*
   * ─────────────────────────────────────────────
   * Error state
   * ─────────────────────────────────────────────
   */
  if (isError) {
    return (
      <section className="px-3 pt-5">
        <p className="mb-2 px-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-(--text-muted)">
          WORKSPACES
        </p>

        <div
          className="
            rounded-md
            border border-transparent
            px-2 py-2
          "
        >
          <p className="font-mono text-xs text-(--danger)">
            Unable to load workspaces.
          </p>
        </div>
      </section>
    );
  }

  /*
   * ─────────────────────────────────────────────
   * Empty state
   * ─────────────────────────────────────────────
   */
  if (workspaces.length === 0) {
    return (
      <section className="px-3 pt-5">
        <p className="mb-2 px-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-(--text-muted)">
          WORKSPACES
        </p>

        <div
          className="
            flex h-9 items-center gap-2 px-2
            rounded-md
            border border-transparent
          "
        >
          <HugeiconsIcon
            icon={Briefcase01Icon}
            size={16}
            strokeWidth={1.5}
            className="text-(--text-muted)"
          />

          <span className="font-mono text-xs text-(--text-muted)">
            No workspaces
          </span>
        </div>
      </section>
    );
  }

  /*
   * Resolve currently active workspace.
   */
  const activeWorkspace =
    workspaces.find(
      (workspace) => workspace.id === activeWorkspaceId,
    ) ?? workspaces[0];

  /*
   * ─────────────────────────────────────────────
   * Expanded sidebar
   * ─────────────────────────────────────────────
   */
  return (
    <section className="px-3 pt-5">
      <p className="mb-2 px-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-(--text-muted)">
        WORKSPACES
      </p>

      <div
        ref={dropdownRef}
        className="relative"
        onMouseEnter={() => {
          if (!mobile) {
            setIsOpen(true);
          }
        }}
        onMouseLeave={() => {
          if (!mobile) {
            setIsOpen(false);
          }
        }}
      >
        {/* Workspace trigger */}
        <button
          type="button"
          title={activeWorkspace.name}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={(event) => {
            event.stopPropagation();
            setIsOpen((previous) => !previous);
          }}
          className={[
            "group flex h-9 w-full cursor-pointer items-center gap-2",
            "rounded-md border border-transparent",
            "px-2 font-mono text-sm",
            "transition-all duration-150",
            isOpen
              ? "border-(--brand) bg-(--brand-muted) text-(--text-primary)"
              : "text-(--text-secondary) hover:border-(--brand) hover:bg-(--brand-muted) hover:text-(--text-primary)",
          ].join(" ")}
        >
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={14}
            strokeWidth={1.5}
            className={[
              "shrink-0 transition-transform duration-150",
              isOpen
                ? "rotate-180 text-(--text-secondary)"
                : "text-(--text-muted) group-hover:text-(--text-secondary)",
            ].join(" ")}
          />

          <HugeiconsIcon
            icon={KanbanIcon}
            size={16}
            strokeWidth={1.5}
            className={[
              "shrink-0 transition-colors duration-150",
              isOpen
                ? "text-(--text-primary)"
                : "text-(--text-secondary) group-hover:text-(--text-primary)",
            ].join(" ")}
          />

          <span className="min-w-0 flex-1 truncate text-left">
            {activeWorkspace.name}
          </span>
        </button>

        {/* Workspace dropdown */}
        {isOpen && (
          <div
            role="listbox"
            aria-label="Select workspace"
            onClick={(event) => {
              event.stopPropagation();
            }}
            className="
              absolute left-0 right-0 top-full z-50 mt-1
              overflow-hidden
              rounded-lg
              border border-(--border)
              bg-(--bg-surface)
              shadow-[0_12px_30px_rgba(0,0,0,0.45)]
            "
          >
            {/* Header */}
            <div className="border-b border-(--border) px-3 py-2">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-(--text-muted)">
                Workspaces
              </p>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="space-y-1 px-2 py-2">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex min-h-10 items-center gap-2 px-2"
                  >
                    <div className="size-4 shrink-0 animate-pulse rounded bg-(--surface-elevated)" />

                    <div
                      className={[
                        "h-3 animate-pulse rounded bg-(--surface-elevated)",
                        item === 1
                          ? "w-28"
                          : item === 2
                            ? "w-20"
                            : "w-24",
                      ].join(" ")}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Workspace list */}
            {!isLoading && (
              <div className="max-h-64 overflow-y-auto py-1">
                {workspaces.map((workspace) => {
                  const isActive =
                    workspace.id === activeWorkspace.id;

                  return (
                    <button
                      key={workspace.id}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleWorkspaceChange(workspace.id);
                      }}
                      className={[
                        "group flex min-h-10 w-full cursor-pointer items-center gap-2",
                        "border border-transparent",
                        "px-3 py-2.5",
                        "text-left font-mono text-xs",
                        "transition-all duration-100",
                        isActive
                          ? "border-(--brand) bg-(--brand-muted) text-(--text-primary)"
                          : "text-(--text-secondary) hover:border-(--brand) hover:bg-(--brand-muted) hover:text-(--text-primary)",
                      ].join(" ")}
                    >
                      <span className="flex size-4 shrink-0 items-center justify-center">
                        {isActive && (
                          <HugeiconsIcon
                            icon={CheckmarkCircle01Icon}
                            size={14}
                            strokeWidth={1.5}
                            className="text-(--brand)"
                          />
                        )}
                      </span>

                      <HugeiconsIcon
                        icon={KanbanIcon}
                        size={20}
                        color="currentColor"
                        strokeWidth={1.5}
                      />

                      <span className="min-w-0 flex-1 truncate">
                        {workspace.name}
                      </span>

                      {workspace.status === "deletion_pending" && (
                        <span className="font-mono text-[9px] uppercase tracking-wider text-(--warning)">
                          Pending
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Error inside dropdown */}
            {isError && !isLoading && (
              <div className="px-3 py-3">
                <p className="font-mono text-xs text-(--danger)">
                  Unable to load workspaces.
                </p>
              </div>
            )}

            {/* Empty inside dropdown */}
            {!isLoading &&
              !isError &&
              workspaces.length === 0 && (
                <div className="px-3 py-3">
                  <p className="font-mono text-xs text-(--text-muted)">
                    No workspaces
                  </p>
                </div>
              )}
          </div>
        )}
      </div>
    </section>
  );
};

export default SidebarWorkspace;

