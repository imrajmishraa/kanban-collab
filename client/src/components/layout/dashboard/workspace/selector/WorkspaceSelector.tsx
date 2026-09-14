import { useCallback, useEffect, useRef, useState } from "react";


import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  CheckmarkCircle01Icon,
  Folder01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";

import { useInfiniteWorkspaces } from "@/hooks/dashboard/useInfiniteWorkspaces";

import type { Workspace } from "@/types/api/dashboard/workspace";

const SEARCH_DEBOUNCE_MS = 300;

interface WorkspaceSelectorProps {
  activeWorkspaceId: string | null;
  activeWorkspaceName: string | null;
  onWorkspaceChange: (id: string, name: string) => void;
  triggerClassName?: string;
  dropdownClassName?: string;
}

export function WorkspaceSelector({
  activeWorkspaceId,
  activeWorkspaceName,
  onWorkspaceChange,
  triggerClassName,
  dropdownClassName,
}: WorkspaceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(
      () => setDebouncedSearch(searchInput.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(t);
  }, [searchInput]);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteWorkspaces(debouncedSearch, 10);

  const workspaces = data?.pages.flatMap((p) => p.workspaces) ?? [];

  const toggleOpen = () => {
    setIsOpen((prev) => {
      if (!prev) {
        setSearchInput("");
        setDebouncedSearch("");
      }
      return !prev;
    });
  };

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
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
    (workspace: Workspace) => {
      onWorkspaceChange(workspace.id, workspace.name);
      setIsOpen(false);
    },
    [onWorkspaceChange],
  );

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (nearBottom) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={[
          "group flex h-7 cursor-pointer items-center gap-1.5",
          "rounded-md border border-white/8 bg-white/6 px-2",
          "font-mono text-[11px]",
          "transition-colors duration-150",
          isOpen
            ? "border-white/14 bg-white/8 text-(--text-primary)"
            : "text-(--text-secondary) hover:border-white/14 hover:bg-white/8 hover:text-(--text-primary)",
          triggerClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <HugeiconsIcon
          icon={Folder01Icon}
          size={12}
          strokeWidth={1.6}
          className={[
            "shrink-0 transition-colors duration-150",
            isOpen
              ? "text-(--brand)"
              : "text-(--text-muted) group-hover:text-(--brand)",
          ].join(" ")}
        />

        <span className="max-w-32 truncate">
          {activeWorkspaceName ?? "Select workspace"}
        </span>

        <HugeiconsIcon
          icon={ArrowDown01Icon}
          size={10}
          strokeWidth={1.8}
          className={[
            "shrink-0 text-(--text-muted) transition-transform duration-150",
            isOpen && "rotate-180",
          ].join(" ")}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Select workspace"
          className={[
            "absolute left-0 top-full z-50 mt-1.5 flex flex-col overflow-hidden rounded-lg",
            "border border-white/10 bg-(--bg-surface)",
            "shadow-[0_8px_24px_-6px_rgba(0,0,0,0.7)]",
            "max-h-[min(320px,calc(100vh-8rem))]",
            dropdownClassName ?? "w-56",
          ].join(" ")}
        >
          {/* Search */}
          <div className="shrink-0 border-b border-white/6 p-1.5">
            <div className="relative">
              <HugeiconsIcon
                icon={Search01Icon}
                size={11}
                strokeWidth={1.6}
                className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-(--text-muted)"
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search…"
                autoFocus
                className="w-full rounded border border-white/8 bg-white/3 py-1 pl-6.5 pr-2 font-mono text-[11px] text-(--text-primary) placeholder:text-(--text-muted) outline-none transition-colors focus:border-white/16 focus:bg-white/5"
              />
            </div>
          </div>

          {/* List */}
          <div
            ref={listRef}
            onScroll={handleScroll}
            className="min-h-0 flex-1 overflow-y-auto p-1"
          >
            {isError ? (
              <p className="px-2 py-2 font-mono text-[11px] text-(--danger)">
                Unable to load workspaces.
              </p>
            ) : isLoading ? (
              <WorkspaceSkeleton />
            ) : workspaces.length === 0 ? (
              <p className="px-2 py-3 text-center font-mono text-[11px] text-(--text-muted)">
                {debouncedSearch
                  ? `No matches for "${debouncedSearch}"`
                  : "No workspaces"}
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
                        "group flex h-7 w-full cursor-pointer items-center gap-2",
                        "rounded px-2",
                        "text-left font-mono text-[11px]",
                        "transition-colors duration-150",
                        isActive
                          ? "bg-white/5 text-(--text-primary)"
                          : "text-(--text-secondary) hover:bg-white/4 hover:text-(--text-primary)",
                      ].join(" ")}
                    >
                      <span className="flex size-3.5 shrink-0 items-center justify-center">
                        {isActive && (
                          <HugeiconsIcon
                            icon={CheckmarkCircle01Icon}
                            size={11}
                            strokeWidth={1.6}
                            className="text-(--brand)"
                          />
                        )}
                      </span>

                      <HugeiconsIcon
                        icon={Folder01Icon}
                        size={13}
                        strokeWidth={1.5}
                        className="shrink-0"
                      />

                      <span className="min-w-0 flex-1 truncate">
                        {workspace.name}
                      </span>
                    </button>
                  );
                })}

                {isFetchingNextPage && (
                  <div className="flex h-7 items-center justify-center">
                    <span className="font-mono text-[9px] text-(--text-muted)">
                      Loading…
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function WorkspaceSkeleton() {
  return (
    <div className="space-y-0.5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex h-7 items-center gap-2 rounded px-2">
          <div className="size-3.5 shrink-0 animate-pulse rounded bg-white/8" />
          <div
            className={[
              "h-2.5 animate-pulse rounded bg-white/8",
              i === 1 ? "w-24" : i === 2 ? "w-20" : i === 3 ? "w-22" : "w-16",
            ].join(" ")}
          />
        </div>
      ))}
    </div>
  );
}
