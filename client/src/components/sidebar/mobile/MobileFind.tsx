import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Cancel01Icon,
  DashboardSquare02Icon,
  LayersIcon,
  LogsIcon,
  Note01Icon,
  Search01Icon,
  Settings01Icon,
  UserGroupIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";

import { useActiveWorkspace } from "@/stores/activeWorkspace";

interface FindEntry {
  label: string;
  href: string;
  icon: typeof LayersIcon;
  /** Second line: what the entry belongs to. */
  context: string;
}

/**
 * Find, for the phone panel only.
 *
 * `SidebarSearch` is the rail's field: it has a collapsed variant, an `F`
 * shortcut, a tooltip and a 320px popover. None of that means anything on a
 * phone, so this is its own component — one closed field on the page
 * background, and a card that grows out of it to the right, the same card the
 * workspace picker opens.
 */
export default function MobileFind() {
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
          href: "/workspaces",
          icon: DashboardSquare02Icon,
          context: "Account",
        };

    return [
      primary,
      { label: "Boards", href: "/boards", icon: LayersIcon, context: scope },
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

  useEffect(() => {
    if (!open) return;

    /* The field is the point of the card, so it takes the caret. */
    inputRef.current?.focus();

    const onDown = (event: MouseEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return;
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
    <div ref={containerRef} className="relative">
      {/* The closed field. Hidden while the card is open — the card sits on top
          of it, so the field looks like the thing that grew. */}
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        className={[
          "group/find flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg border text-left",
          "border-(--hairline) bg-(--bg-root)",
          "transition-[opacity,border-color] duration-200",
          open
            ? "pointer-events-none opacity-0"
            : "opacity-100 hover:border-(--hairline-strong)",
        ].join(" ")}
      >
        <div className="pl-2.5">
          <HugeiconsIcon
            icon={Search01Icon}
            size={14}
            strokeWidth={1.6}
            className="shrink-0 text-(--text-muted) transition-colors duration-200 group-hover/find:text-(--text-soft)"
          />
        </div>

        <span className="min-w-0 flex-1 truncate text-[12.5px] tracking-tight text-(--text-muted)">
          Find functions
        </span>

        <span
          aria-hidden="true"
          className="flex shrink-0 items-center self-stretch border-l border-(--hairline) pr-0.5 text-(--text-muted) bg-(--tint-4)"
        >
          <div className="px-2.5">
            <HugeiconsIcon icon={Search01Icon} size={13} strokeWidth={1.8} />
          </div>
        </span>
      </button>

      {/* Always mounted, so width and height can transition. `inert` keeps the
          rows out of the tab order while it is closed. */}
      <div
        role="dialog"
        aria-label="Find"
        aria-hidden={!open}
        inert={!open}
        className={[
          "absolute left-0 top-0 z-50 overflow-hidden border bg-(--bg-root)",
          "shadow-[0_18px_50px_-12px_rgba(0,0,0,0.28)]",
          "transition-[width,border-radius,opacity] duration-300 ease-out",
          "motion-reduce:transition-none",
          open
            ? "w-[min(20rem,calc(100vw-2rem))] rounded-xl border-(--hairline-strong) opacity-100"
            : "pointer-events-none w-[calc(100%-1.5rem)] rounded-lg border-(--hairline-strong) opacity-0",
        ].join(" ")}
      >
        <div
          className={[
            "flex items-center gap-2 border-b border-(--hairline)",
            "transition-[height,padding] duration-300 ease-out motion-reduce:transition-none",
            open ? "h-12 px-3" : "h-9 px-2",
          ].join(" ")}
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
            onChange={(event) => {
              setQuery(event.target.value);
              setCursor(0);
            }}
            onKeyDown={onInputKeyDown}
            placeholder="Find functions"
            aria-label="Find functions"
            className="min-w-0 flex-1 bg-transparent text-[12.5px] tracking-tight text-(--text-primary) placeholder:text-(--text-subtle) outline-hidden"
          />

          <button
            type="button"
            onClick={close}
            aria-label="Close search"
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

        <div
          className={[
            "p-1.5 transition-[max-height,opacity] duration-300 ease-out motion-reduce:transition-none",
            open
              ? "max-h-60 overflow-y-auto opacity-100"
              : "max-h-0 overflow-hidden opacity-0",
          ].join(" ")}
        >
          {results.length === 0 ? (
            <p className="px-2 py-4 text-center text-[11.5px] text-(--text-muted)">
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
                  "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-left",
                  "transition-colors duration-150",
                  index === cursor ? "bg-(--tint-6)" : "hover:bg-(--tint-6)",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex size-7 shrink-0 items-center justify-center rounded-md border border-(--hairline)",
                    index === cursor
                      ? "text-(--accent)"
                      : "text-(--text-muted)",
                  ].join(" ")}
                >
                  <HugeiconsIcon
                    icon={entry.icon}
                    size={14}
                    strokeWidth={1.6}
                  />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-medium tracking-tight text-(--text-primary)">
                    {entry.label}
                  </span>
                  <span className="block truncate text-[11px] text-(--text-muted)">
                    {entry.context}
                  </span>
                </span>

                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={12}
                  strokeWidth={2}
                  className="shrink-0 text-(--text-subtle)"
                />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
