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
   * Close dropdown if sidebar becomes collapsed.
   */
  useEffect(() => {
    if (collapsed) {
      setIsOpen(false);
    }
  }, [collapsed]);

  /*
   * Collapsed sidebar.
   */
  if (collapsed) {
    return (
      <div className="flex justify-center px-2 py-3">
        <button
          type="button"
          title="Workspace"
          className="flex size-9 cursor-pointer items-center justify-center text-neutral-500 transition-colors hover:bg-white/4 hover:text-neutral-200"
        >
          <Briefcase className="size-4" />
        </button>
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
   * Resolve the currently active workspace.
   */
  const activeWorkspace =
    workspaces.find((workspace) => workspace.id === activeWorkspaceId) ??
    workspaces[0];

  /*
   * Select workspace.
   */
  const handleWorkspaceChange = (workspaceId: string) => {
    onWorkspaceChange(workspaceId);
    setIsOpen(false);
  };

  return (
    <section className="px-3 pt-5">
      <p className="mb-2 px-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-neutral-600">
        WORKSPACE
      </p>

      <div ref={dropdownRef} className="relative">
        {/* Workspace trigger */}
        <button
          type="button"
          title={activeWorkspace.name}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((previous) => !previous)}
          className={[
            "flex h-9 w-full cursor-pointer items-center gap-2 px-2",
            "font-mono text-sm text-neutral-300",
            "transition-colors hover:bg-white/3",
            isOpen ? "bg-white/4" : "",
          ].join(" ")}
        >
          <ChevronDown
            className={[
              "size-3.5 shrink-0 text-neutral-600",
              "transition-transform duration-150",
              isOpen ? "rotate-180" : "",
            ].join(" ")}
          />

          <Briefcase className="size-4 shrink-0 text-neutral-500" />

          <span className="min-w-0 flex-1 truncate text-left">
            {activeWorkspace.name}
          </span>
        </button>

        {/* Dropdown */}
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
            {/* Dropdown header */}
            <div className="border-b border-neutral-800 px-3 py-2">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-600">
                Select workspace
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
                    onClick={() => handleWorkspaceChange(workspace.id)}
                    className={[
                      "flex w-full cursor-pointer items-center gap-2",
                      "px-3 py-2.5",
                      "text-left font-mono text-xs",
                      "transition-colors",
                      isActive
                        ? "bg-white/5 text-neutral-100"
                        : "text-neutral-500 hover:bg-white/3 hover:text-neutral-300",
                    ].join(" ")}
                  >
                    <span className="flex size-4 shrink-0 items-center justify-center">
                      {isActive && <Check className="size-3 text-rose-500" />}
                    </span>

                    <span className="min-w-0 flex-1 truncate">
                      {workspace.name}
                    </span>

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
