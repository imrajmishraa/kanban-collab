import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  FilterAddIcon,
  FilterMailRemoveIcon,
  FilterRemoveIcon,
  LayersIcon,
  LayoutListIcon,
  LogsIcon,
  Message01Icon,
  MoreHorizontalIcon,
  PaperclipIcon,
  Search01Icon,
  Settings01Icon,
  SlackIcon,
  Tick02Icon,
  UserGroupIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";

import { cn } from "@/utils/cn";

import { notificationKeys, notificationsApi } from "@/features/dashboard";
import { toastError } from "@/lib/toast";

import type { AppNotification } from "@/types/notification";

const TABS = ["Inbox", "Unread", "Comments"] as const;
type Tab = (typeof TABS)[number];

/**
 * The categories the filter offers, each with the glyph that names it.
 *
 * Notifications only carry a handful of `type`s, so a category is a predicate
 * over the type and, where nothing fits, over the title and message text — the
 * honest reading of a label like "Columns", which no notification type covers.
 */
const CATEGORIES = [
  { label: "Accounts", icon: UserIcon },
  { label: "Activity", icon: LogsIcon },
  { label: "Attachments", icon: PaperclipIcon },
  { label: "Boards", icon: LayersIcon },
  { label: "Cards", icon: LayoutListIcon },
  { label: "Members", icon: UserGroupIcon },
  { label: "Workspace", icon: SlackIcon },
] as const;

type Category = (typeof CATEGORIES)[number]["label"];

function inCategory(
  notification: AppNotification,
  category: Category,
): boolean {
  const text = `${notification.title} ${notification.message}`.toLowerCase();
  const type = notification.type;

  switch (category) {
    case "Activity":
      return true;
    case "Boards":
      return type === "BOARD_SHARED" || text.includes("board");
    case "Attachments":
      return text.includes("attach");
    case "Workspace":
      return type.startsWith("WORKSPACE_") || text.includes("workspace");
    case "Members":
      return type === "WORKSPACE_ROLE_CHANGED" || text.includes("member");
    case "Cards":
      return type.startsWith("CARD_") || text.includes("card");
    case "Accounts":
      return (
        type === "WORKSPACE_DELETION_SCHEDULED" || text.includes("account")
      );
    default:
      return true;
  }
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60_000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;

  return `${Math.round(hours / 24)}d`;
}

/**
 * The inbox itself: tabs, search, the filter menu, the rows and the mutations
 * behind them. One component, so the phone sheet and the desktop panel cannot
 * drift apart — they are two shells around this.
 */
export default function NotificationsFeed() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<Tab>("Inbox");
  const [query, setQuery] = useState("");

  /* A set, not one value: the categories overlap (a card notification can be
     about a board), so "Cards and Columns together" has to be expressible. */
  const [categories, setCategories] = useState<Category[]>([]);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: notificationKeys.all,
    queryFn: () => notificationsApi.listNotifications(),
  });

  const refresh = () =>
    void queryClient.invalidateQueries({ queryKey: notificationKeys.all });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: refresh,
    onError: (error) => toastError(error),
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: refresh,
    onError: (error) => toastError(error),
  });

  const clearAll = useMutation({
    mutationFn: () => notificationsApi.clearAll(),
    onSuccess: refresh,
    onError: (error) => toastError(error),
  });

  const clearOne = useMutation({
    mutationFn: (id: string) => notificationsApi.clear(id),
    onSuccess: refresh,
    onError: (error) => toastError(error),
  });

  const mute = useMutation({
    mutationFn: (type: AppNotification["type"]) =>
      notificationsApi.muteType(type),
    onSuccess: refresh,
    onError: (error) => toastError(error),
  });

  const needle = query.trim().toLowerCase();

  const filterActive =
    tab !== "Inbox" || needle.length > 0 || categories.length > 0;

  const rows = useMemo(() => {
    /* Built here, not above: `?? []` makes a new array every render, which would
       invalidate this memo on every render and defeat it. */
    const all = data?.notifications ?? [];

    const scoped =
      tab === "Unread"
        ? all.filter((item) => !item.isRead)
        : tab === "Comments"
          ? all.filter(
              (item) =>
                item.type === "COMMENT_ADDED" || item.type === "MENTION",
            )
          : all;

    const byCategory =
      categories.length === 0
        ? scoped
        : scoped.filter((item) =>
            categories.some((category) => inCategory(item, category)),
          );

    if (!needle) return byCategory;

    return byCategory.filter(
      (item) =>
        item.title.toLowerCase().includes(needle) ||
        item.message.toLowerCase().includes(needle),
    );
  }, [data, tab, categories, needle]);

  /* Two menus, same close behaviour. */
  useEffect(() => {
    if (!menuOpen) return;

    const onDown = (event: MouseEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return;
      setMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!filterOpen) return;

    const onDown = (event: MouseEvent) => {
      if (filterRef.current?.contains(event.target as Node)) return;
      setFilterOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFilterOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [filterOpen]);

  const toggleCategory = (category: Category) => {
    setCategories((previous) =>
      previous.includes(category)
        ? previous.filter((item) => item !== category)
        : [...previous, category],
    );
    setTab("Inbox");
  };

  const clearFilters = () => {
    setTab("Inbox");
    setQuery("");
    setCategories([]);
    setFilterOpen(false);
  };

  const openItem = (notification: AppNotification) => {
    if (!notification.isRead) markRead.mutate(notification.id);

    if (notification.boardId) {
      navigate(`/boards/${notification.boardId}`);
      return;
    }

    if (notification.workspaceId) {
      navigate(`/workspaces/${notification.workspaceId}`);
    }
  };

  const emptyLine = needle
    ? `Nothing matches “${query.trim()}”`
    : categories.length === 1
      ? `No ${categories[0]!.toLowerCase()} notifications`
      : categories.length > 1
        ? "Nothing in the selected filters"
        : tab === "Comments"
          ? "No new comments"
          : tab === "Unread"
            ? "You're all caught up"
            : "No notifications yet";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Tabs, the 3-dot and the ways out. */}
      <div className="flex shrink-0 items-center gap-1 border-b border-(--hairline) px-3 py-1.5">
        {TABS.map((option) => {
          const active = tab === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => setTab(option)}
              aria-pressed={active}
              className={[
                "relative h-8 cursor-pointer rounded-md px-2.5 text-[12px] transition-colors duration-200",
                active
                  ? "text-(--text-primary)"
                  : "text-(--text-muted) hover:bg-(--tint-4) hover:text-(--text-primary)",
              ].join(" ")}
            >
              {option}
              {active && (
                <span className="absolute inset-x-2 -bottom-1.75 h-0.5 rounded-full bg-(--accent)" />
              )}
            </button>
          );
        })}

        <div ref={menuRef} className="relative ml-auto">
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label="Notification actions"
            className={[
              "flex size-7 cursor-pointer items-center justify-center rounded-md transition-colors duration-200",
              menuOpen
                ? "bg-(--tint-8) text-(--text-primary)"
                : "text-(--text-muted) hover:bg-(--bg-hover) hover:text-(--text-primary)",
            ].join(" ")}
          >
            <HugeiconsIcon
              icon={MoreHorizontalIcon}
              size={16}
              strokeWidth={1.8}
            />
          </button>

          {menuOpen && (
            <div
              role="menu"
              aria-label="Notification actions"
              className="
                absolute right-0 top-full z-50 mt-2 w-42 overflow-hidden rounded-xl
                border border-(--hairline) bg-(--bg-surface) p-1.5
                shadow-[0_18px_50px_-12px_rgba(0,0,0,0.28)]
              "
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  clearAll.mutate();
                }}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12.5px] text-(--text-soft) transition-colors duration-150 hover:bg-(--tint-4) hover:text-(--text-primary)"
              >
                <HugeiconsIcon
                  icon={FilterMailRemoveIcon}
                  size={16}
                  strokeWidth={1.6}
                  className="shrink-0 text-(--text-secondary)"
                />
                Clear all
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  markAllRead.mutate();
                }}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12.5px] text-(--text-soft) transition-colors duration-150 hover:bg-(--tint-4) hover:text-(--text-primary)"
              >
                <HugeiconsIcon
                  icon={Tick02Icon}
                  size={16}
                  strokeWidth={1.6}
                  className="shrink-0 text-(--text-secondary)"
                />
                Mark as read
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/account/settings/notifications");
                }}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12.5px] text-(--text-soft) transition-colors duration-150 hover:bg-(--tint-4) hover:text-(--text-primary)"
              >
                <HugeiconsIcon
                  icon={Settings01Icon}
                  size={16}
                  strokeWidth={1.6}
                  className="shrink-0 text-(--text-secondary)"
                />
                Settings
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search, and the filter chip beside it. */}
      <div className="flex shrink-0 items-center gap-2 border-b border-(--hairline) px-3 py-2">
        <div className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-lg border border-(--hairline) bg-(--tint-3) px-2.5">
          <HugeiconsIcon
            icon={Search01Icon}
            size={13}
            strokeWidth={1.6}
            className="shrink-0 text-(--text-muted)"
          />

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search notifications"
            aria-label="Search notifications"
            className="min-w-0 flex-1 bg-transparent text-[12px] tracking-tight text-(--text-primary) placeholder:text-(--text-subtle) outline-hidden"
          />
        </div>

        <div ref={filterRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => {
              if (filterActive) {
                clearFilters();
                return;
              }

              setFilterOpen((value) => !value);
            }}
            aria-expanded={filterActive ? undefined : filterOpen}
            aria-haspopup="menu"
            aria-pressed={filterActive}
            aria-label={filterActive ? "Clear filter" : "Filter"}
            className={[
              "flex h-8 cursor-pointer items-center gap-1 rounded-lg border px-2.5 text-[11.5px] transition-colors duration-200",
              filterActive
                ? "border-(--hairline-strong) text-(--accent)"
                : "border-(--hairline) text-(--text-secondary) hover:border-(--hairline-strong) hover:text-(--text-primary)",
            ].join(" ")}
          >
            <HugeiconsIcon
              icon={filterActive ? FilterRemoveIcon : FilterAddIcon}
              size={12}
              strokeWidth={2}
            />
            {filterActive
              ? categories.length > 1
                ? `Clear · ${categories.length}`
                : "Clear"
              : "Filter"}
          </button>

          {filterOpen ? (
            <div
              role="menu"
              aria-label="Filter notifications"
              aria-multiselectable="true"
              className="
                absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden
                rounded-xl border border-(--hairline) bg-(--bg-surface) p-1.5
                shadow-[0_18px_50px_-12px_rgba(0,0,0,0.28)]
              "
            >
              {/* Stays open while toggling: picking a second category is the
                  point of the checkboxes. */}
              {CATEGORIES.map((option) => {
                const checked = categories.includes(option.label);

                return (
                  <button
                    key={option.label}
                    type="button"
                    role="menuitemcheckbox"
                    aria-checked={checked}
                    onClick={() => toggleCategory(option.label)}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12.5px] transition-colors duration-150 hover:bg-(--tint-4) hover:text-(--text-primary)",
                      checked ? "text-(--text-primary)" : "text-(--text-soft)",
                    )}
                  >
                    <HugeiconsIcon
                      icon={option.icon}
                      size={15}
                      strokeWidth={1.7}
                      aria-hidden="true"
                      className="shrink-0 text-(--text-muted)"
                    />

                    <span className="min-w-0 flex-1 truncate">
                      {option.label}
                    </span>

                    {/* Last in the row, so every tick lines up in one column. */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded border transition-colors duration-150",
                        checked
                          ? "border-(--accent) bg-(--accent) text-(--solid-text)"
                          : "border-(--hairline-strong) bg-transparent",
                      )}
                    >
                      {checked ? (
                        <HugeiconsIcon
                          icon={Tick02Icon}
                          size={10}
                          strokeWidth={3}
                        />
                      ) : null}
                    </span>
                  </button>
                );
              })}

              {categories.length > 0 && (
                <div className="mt-1 border-t border-(--hairline) pt-1">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="flex w-full cursor-pointer items-center rounded-lg px-2.5 py-2 text-left text-[12.5px] text-(--text-secondary) transition-colors duration-150 hover:bg-(--tint-4) hover:text-(--text-primary)"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* The feed. */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2">
        {isLoading ? (
          <div className="space-y-px">
            {[0, 1, 2].map((row) => (
              <div key={row} className="flex gap-3 px-3.5 py-3">
                <div className="size-7 shrink-0 animate-pulse rounded-full bg-(--tint-6)" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-2.5 w-24 animate-pulse rounded bg-(--tint-6)" />
                  <div className="h-2.5 w-full animate-pulse rounded bg-(--tint-4)" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <p className="px-3.5 py-10 text-center text-[12px] text-(--danger)">
            Could not load notifications
          </p>
        ) : rows.length === 0 ? (
          <div className="px-3.5 py-12 text-center">
            <span className="mx-auto flex size-10 items-center justify-center rounded-full border border-(--hairline) text-(--text-subtle)">
              <HugeiconsIcon icon={Message01Icon} size={17} strokeWidth={1.6} />
            </span>

            <p className="mt-3 text-[12.5px] text-(--text-secondary)">
              {emptyLine}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-(--hairline)">
            {rows.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => openItem(item)}
                  className="flex w-full cursor-pointer items-start gap-3 px-3.5 py-3 text-left transition-colors duration-200 hover:bg-(--tint-4)"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-1.5 size-1.5 shrink-0 rounded-full",
                      item.isRead ? "bg-(--text-subtle)" : "bg-(--accent)",
                    )}
                  />

                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="min-w-0 truncate text-[12px] font-medium tracking-tight text-(--text-primary)">
                        {item.title}
                      </span>

                      <time
                        dateTime={item.createdAt}
                        className="shrink-0 font-mono text-[9px] tabular-nums text-(--text-subtle)"
                      >
                        {relativeTime(item.createdAt)}
                      </time>
                    </span>

                    <span className="mt-1 block text-[11.5px] leading-5 text-(--text-secondary)">
                      {item.message}
                    </span>
                  </span>
                </button>

                <div className="flex items-center gap-1 px-3.5 pb-2">
                  {!item.isRead && (
                    <button
                      type="button"
                      onClick={() => markRead.mutate(item.id)}
                      className="cursor-pointer rounded px-1.5 py-0.5 text-[10.5px] text-(--text-muted) transition-colors duration-150 hover:bg-(--tint-4) hover:text-(--text-primary)"
                    >
                      Mark read
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => clearOne.mutate(item.id)}
                    className="cursor-pointer rounded px-1.5 py-0.5 text-[10.5px] text-(--text-muted) transition-colors duration-150 hover:bg-(--tint-4) hover:text-(--text-primary)"
                  >
                    Clear
                  </button>

                  <button
                    type="button"
                    onClick={() => mute.mutate(item.type)}
                    className="cursor-pointer rounded px-1.5 py-0.5 text-[10.5px] text-(--text-muted) transition-colors duration-150 hover:bg-(--tint-4) hover:text-(--text-primary)"
                  >
                    Mute
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
