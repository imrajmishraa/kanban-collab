import { useEffect, useRef, useState } from "react";
import { Briefcase, Check, ChevronDown } from "lucide-react";

import type { Workspace } from "@/types/api/dashboard/workspace";

interface SidebarWorkspaceProps {
  collapsed: boolean;
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  onWorkspaceChange: (workspaceId: string) => void;
  isLoading: boolean;
  isError: boolean;
}

const SidebarWorkspace = ({
  collapsed,
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
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  /*
   * Close dropdown with Escape.
   */
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  /*
   * Close dropdown when sidebar becomes collapsed.
   */
  useEffect(() => {
    if (collapsed) {
      setIsOpen(false);
    }
  }, [collapsed]);

  /*
   * Select workspace.
   */
  const handleWorkspaceChange = (workspaceId: string) => {
    onWorkspaceChange(workspaceId);
    setIsOpen(false);
  };

  /*
   * Collapsed sidebar.
   *
   * Hovering the workspace icon reveals a workspace flyout.
   */
  if (collapsed) {
    return (
      <div
        className="relative flex justify-center px-2 py-3"
        onMouseEnter={() => setIsWorkspaceHovered(true)}
        onMouseLeave={() => setIsWorkspaceHovered(false)}
      >
        {/* Workspace icon */}
        <button
          type="button"
          title="Workspaces"
          aria-label="Open workspaces"
          onClick={(event) => {
            event.stopPropagation();
          }}
          className={[
            "flex size-9 cursor-pointer items-center justify-center",
            "text-neutral-500",
            "transition-colors duration-150",
            isWorkspaceHovered
              ? "bg-white/5 text-neutral-200"
              : "hover:bg-white/4 hover:text-neutral-200",
          ].join(" ")}
        >
          <Briefcase className="size-4" />
        </button>

        {/* Workspace flyout */}
        {isWorkspaceHovered && (
          <div
            className="fixed z-100 w-60"
            style={{
              left: "4.5rem",
              top: "4.25rem",
            }}
            onMouseEnter={() => setIsWorkspaceHovered(true)}
            onMouseLeave={() => setIsWorkspaceHovered(false)}
          >
            <div className="overflow-hidden border border-neutral-800 bg-[#0b0b0b] shadow-[0_12px_30px_rgba(0,0,0,0.55)]">
              {/* Header */}
              <div className="border-b border-neutral-800 px-3 py-2.5">
                <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-600">
                  Workspaces
                </p>
              </div>

              {/* Loading */}
              {isLoading && (
                <div className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="size-3.5 text-neutral-700" />

                    <span className="font-mono text-xs text-neutral-600">
                      Loading workspaces...
                    </span>
                  </div>
                </div>
              )}

              {/* Error */}
              {isError && !isLoading && (
                <div className="px-3 py-3">
                  <p className="font-mono text-xs text-red-400">
                    Unable to load workspaces.
                  </p>
                </div>
              )}

              {/* Empty */}
              {!isLoading && !isError && workspaces.length === 0 && (
                <div className="px-3 py-3">
                  <p className="font-mono text-xs text-neutral-600">
                    No workspaces
                  </p>
                </div>
              )}

              {/* Workspace list */}
              {!isLoading && !isError && workspaces.length > 0 && (
                <div className="max-h-64 overflow-y-auto py-1">
                  {workspaces.map((workspace) => {
                    const isActive = workspace.id === activeWorkspaceId;

                    return (
                      <button
                        key={workspace.id}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onWorkspaceChange(workspace.id);
                          setIsWorkspaceHovered(false);
                        }}
                        className={[
                          "flex w-full cursor-pointer items-center gap-2",
                          "px-3 py-2.5",
                          "text-left font-mono text-xs",
                          "transition-colors duration-100",
                          isActive
                            ? "bg-white/5 text-neutral-100"
                            : "text-neutral-500 hover:bg-white/3 hover:text-neutral-300",
                        ].join(" ")}
                      >
                        {/* Active indicator */}
                        <span className="flex size-4 shrink-0 items-center justify-center">
                          {isActive && (
                            <Check className="size-3 text-rose-500" />
                          )}
                        </span>

                        {/* Workspace icon */}
                        <Briefcase className="size-3.5 shrink-0 text-neutral-600" />

                        {/* Workspace name */}
                        <span className="min-w-0 flex-1 truncate">
                          {workspace.name}
                        </span>

                        {/* Pending status */}
                        {workspace.status === "deletion_pending" && (
                          <span className="font-mono text-[9px] uppercase tracking-wider text-amber-500">
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
   * Loading state.
   */
  if (isLoading) {
    return (
      <section className="px-3 pt-5">
        <p className="mb-2 px-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-neutral-600">
          WORKSPACE
        </p>

        <div className="flex h-9 items-center gap-2 px-2">
          <Briefcase className="size-4 text-neutral-700" />

          <span className="font-mono text-xs text-neutral-600">Loading...</span>
        </div>
      </section>
    );
  }

  /*
   * Error state.
   */
  if (isError) {
    return (
      <section className="px-3 pt-5">
        <p className="mb-2 px-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-neutral-600">
          WORKSPACE
        </p>

        <div className="px-2 py-2">
          <p className="font-mono text-xs text-red-400">
            Unable to load workspaces.
          </p>
        </div>
      </section>
    );
  }

  /*
   * Empty state.
   */
  if (workspaces.length === 0) {
    return (
      <section className="px-3 pt-5">
        <p className="mb-2 px-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-neutral-600">
          WORKSPACE
        </p>

        <div className="flex h-9 items-center gap-2 px-2">
          <Briefcase className="size-4 text-neutral-700" />

          <span className="font-mono text-xs text-neutral-600">
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
    workspaces.find((workspace) => workspace.id === activeWorkspaceId) ??
    workspaces[0];

  return (
    <section className="px-3 pt-5">
      <p className="mb-2 px-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-neutral-600">
        WORKSPACES
      </p>

      <div
        ref={dropdownRef}
        className="relative"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {/* Workspace trigger */}
        <button
          type="button"
          title={activeWorkspace.name}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={(event) => {
            event.stopPropagation();
          }}
          className={[
            "group flex h-9 w-full cursor-pointer items-center gap-2 px-2",
            "font-mono text-sm",
            "transition-colors duration-150",
            isOpen
              ? "bg-white/5 text-neutral-100"
              : "text-neutral-400 hover:bg-white/4 hover:text-neutral-200",
          ].join(" ")}
        >
          <ChevronDown
            className={[
              "size-3.5 shrink-0 text-neutral-600",
              "transition-transform duration-150",
              isOpen ? "rotate-180 text-neutral-400" : "",
            ].join(" ")}
          />

          <Briefcase
            className={[
              "size-4 shrink-0 transition-colors duration-150",
              isOpen
                ? "text-neutral-300"
                : "text-neutral-500 group-hover:text-neutral-300",
            ].join(" ")}
          />

          <span className="min-w-0 flex-1 truncate text-left">
            {activeWorkspace.name}
          </span>
        </button>

        {/* Workspace flyout */}
        {isOpen && (
          <div
            role="listbox"
            aria-label="Select workspace"
            className={[
              "absolute left-0 right-0 top-full z-50 mt-1",
              "overflow-hidden border border-neutral-800",
              "bg-[#0b0b0b]",
              "shadow-[0_12px_30px_rgba(0,0,0,0.45)]",
            ].join(" ")}
          >
            {/* Header */}
            <div className="border-b border-neutral-800 px-3 py-2">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-600">
                Workspaces
              </p>
            </div>

            {/* Workspace list */}
            <div className="max-h-64 overflow-y-auto py-1">
              {workspaces.map((workspace) => {
                const isActive = workspace.id === activeWorkspace.id;

                return (
                  <button
                    key={workspace.id}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={(event) => {
                      event.stopPropagation();

                      onWorkspaceChange(workspace.id);
                      setIsOpen(false);
                    }}
                    className={[
                      "flex w-full cursor-pointer items-center gap-2",
                      "px-3 py-2.5",
                      "text-left font-mono text-xs",
                      "transition-colors duration-100",
                      isActive
                        ? "bg-white/5 text-neutral-100"
                        : "text-neutral-500 hover:bg-white/3 hover:text-neutral-300",
                    ].join(" ")}
                  >
                    {/* Active indicator */}
                    <span className="flex size-4 shrink-0 items-center justify-center">
                      {isActive && <Check className="size-3 text-rose-500" />}
                    </span>

                    {/* Workspace icon */}
                    <Briefcase className="size-3.5 shrink-0 text-neutral-600" />

                    {/* Workspace name */}
                    <span className="min-w-0 flex-1 truncate">
                      {workspace.name}
                    </span>

                    {/* Pending status */}
                    {workspace.status === "deletion_pending" && (
                      <span className="font-mono text-[9px] uppercase tracking-wider text-amber-500">
                        Pending
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SidebarWorkspace;
