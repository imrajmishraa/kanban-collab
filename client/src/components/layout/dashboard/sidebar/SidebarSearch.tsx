import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  DashboardSquare02Icon,
  KanbanIcon,
  Note01Icon,
  Search01Icon,
  Settings01Icon,
  LogsIcon,
  UserGroupIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";

import { useActiveWorkspace } from "@/stores/activeWorkspace";

interface SidebarSearchProps {
  collapsed: boolean;
}

interface FindEntry {
  label: string;
  href: string;
  icon: typeof KanbanIcon;
  /** Second line: what the entry belongs to. */
  context: string;
}

export default function SidebarSearch({ collapsed }: SidebarSearchProps) {
  const navigate = useNavigate();
  const { activeWorkspaceId, activeWorkspaceName } = useActiveWorkspace();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scope = activeWorkspaceId
    ? (activeWorkspaceName ?? "Workspace")
    : "Account";

  const entries = useMemo<FindEntry[]>(() => {
    const primary: FindEntry = activeWorkspaceId
      ? {
          label: "Overview",
          href: `/workspaces/${activeWorkspaceId}`,
          icon: DashboardSquare02Icon,
          context: scope,
        }
      : {
          label: "Projects",
          href: "/dashboard",
          icon: DashboardSquare02Icon,
          context: "Account",
        };

    return [
      primary,
      { label: "Boards", href: "/boards", icon: KanbanIcon, context: scope },
      {
        label: "Members",
        href: "/members",
        icon: UserGroupIcon,
        context: scope,
      },
      { label: "Notes", href: "/notes", icon: Note01Icon, context: scope },
      {
        label: "Activity logs",
        href: "/activity",
        icon: LogsIcon,
        context: scope,
      },
      {
        label: "Profile",
        href: "/user/profile",
        icon: UserIcon,
        context: "Account",
      },
      {
        label: "Preferences",
        href: "/settings",
        icon: Settings01Icon,
        context: "Account",
      },
    ];
  }, [activeWorkspaceId, scope]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();

    if (!needle) return entries;

    return entries.filter(
      (entry) =>
        entry.label.toLowerCase().includes(needle) ||
        entry.context.toLowerCase().includes(needle),
    );
  }, [entries, query]);

  const close = () => {
    setOpen(false);
    setQuery("");
    setCursor(0);
  };

  const go = (entry: FindEntry | undefined) => {
    if (!entry) return;
    close();
    navigate(entry.href);
  };

  /* Bare `F` anywhere on the page opens the panel. */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "f") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      const tag = target?.tagName.toLowerCase();

      if (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        target?.isContentEditable
      ) {
        return;
      }

      event.preventDefault();
      setOpen(true);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  /* Focus the panel's own input, and close on an outside click. */
  useEffect(() => {
    if (!open) return;

    inputRef.current?.focus();

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
        setCursor(0);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor((previous) => Math.min(previous + 1, results.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((previous) => Math.max(previous - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      go(results[cursor]);
    }
  };

  return (
    <div ref={containerRef} className="relative px-3 pb-2">
      {collapsed ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={(event) => {
              /* The collapsed rail expands on any click. Opening Find is not
                 a request to expand it, so stop the click here. */
              event.stopPropagation();
              setOpen((previous) => !previous);
            }}
            aria-label="Find"
            aria-expanded={open}
            className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-neutral-500 transition-colors duration-200 hover:bg-white/6 hover:text-neutral-200"
          >
            <HugeiconsIcon icon={Search01Icon} size={15} strokeWidth={1.6} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((previous) => !previous)}
          aria-expanded={open}
          className={[
            "group/find flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg border px-2.5 text-left",
            "transition-[opacity,border-color,background-color] duration-200",
            /* Hidden while the panel is open: the panel sits exactly on top of
               it, so the box appears to be the thing that grew. */
            open ? "pointer-events-none opacity-0" : "opacity-100",
            open
              ? "border-orange-50/30 bg-white/5"
              : "border-orange-50/15 bg-white/3 hover:border-orange-50/30 hover:bg-white/5",
          ].join(" ")}
        >
          <HugeiconsIcon
            icon={Search01Icon}
            size={14}
            strokeWidth={1.6}
            className="shrink-0 text-neutral-500 transition-colors duration-200 group-hover/find:text-neutral-300"
          />

          <span className="min-w-0 flex-1 truncate text-[12.5px] tracking-tight text-neutral-500">
            Find
          </span>

          <kbd className="shrink-0 rounded border border-orange-50/15 bg-white/6 px-1.5 py-0.5 font-mono text-[9px] text-neutral-500">
            F
          </kbd>
        </button>
      )}

      {/* Always mounted so the width and height can transition. `inert` keeps
          the rows out of the tab order while it is closed. */}
      <div
        role="dialog"
        aria-label="Find"
        aria-hidden={!open}
        inert={!open}
        /* Clicks inside the panel are panel clicks, not rail clicks. */
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        className={[
          "absolute z-50 overflow-hidden border bg-[#0c0c0d]",
          "transition-[width,border-radius,opacity] duration-300 ease-out",
          "motion-reduce:transition-none",
          "left-3 top-0",
          open
            ? "w-80 rounded-xl border-orange-50/20 opacity-100"
            : "pointer-events-none w-[calc(100%-1.5rem)] rounded-lg border-orange-50/20 opacity-0",
        ].join(" ")}
      >
        <div
          className={[
            "flex items-center gap-2.5 border-b border-orange-50/10",
            "transition-[height,padding] duration-300 ease-out motion-reduce:transition-none",
            open ? "h-12 px-4" : "h-9 px-2.5",
          ].join(" ")}
        >
          <HugeiconsIcon
            icon={Search01Icon}
            size={15}
            strokeWidth={1.7}
            className="shrink-0 text-neutral-500"
          />

          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCursor(0);
            }}
            onKeyDown={onInputKeyDown}
            placeholder="Find"
            aria-label="Find"
            className={[
              "min-w-0 flex-1 bg-transparent tracking-tight text-neutral-100 placeholder:text-neutral-600 outline-hidden",
              "transition-[font-size] duration-300 ease-out motion-reduce:transition-none",
              open ? "text-[14px]" : "text-[12.5px]",
            ].join(" ")}
          />

          <kbd className="shrink-0 rounded border border-orange-50/15 bg-white/1 px-1.5 py-0.5 font-mono text-[9px] text-neutral-400">
            Esc
          </kbd>
        </div>

        <div
          className={[
            "p-1.5 transition-[max-height,opacity] duration-300 ease-out motion-reduce:transition-none",
            open
              ? "max-h-60 overflow-y-auto opacity-100"
              : "max-h-0 overflow-hidden opacity-0",
          ].join(" ")}
        >
          {results.length === 0 ? (
            <p className="px-2 py-6 text-center text-[12px] text-neutral-500">
              Nothing matches “{query.trim()}”
            </p>
          ) : (
            results.map((entry, index) => (
              <button
                key={entry.href}
                type="button"
                onClick={() => go(entry)}
                onMouseEnter={() => setCursor(index)}
                className={[
                  "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left",
                  "transition-colors duration-150",
                  index === cursor ? "bg-white/8" : "hover:bg-white/6",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex size-8 shrink-0 items-center justify-center rounded-md border border-orange-50/15",
                    index === cursor ? "text-orange-100" : "text-neutral-500",
                  ].join(" ")}
                >
                  <HugeiconsIcon
                    icon={entry.icon}
                    size={15}
                    strokeWidth={1.6}
                  />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium tracking-tight text-neutral-100">
                    {entry.label}
                  </span>
                  <span className="block truncate text-[11.5px] text-neutral-500">
                    {entry.context}
                  </span>
                </span>

                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={12}
                  strokeWidth={2}
                  className="shrink-0 text-neutral-700"
                />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
