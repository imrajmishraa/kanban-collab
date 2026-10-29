import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Message01Icon,
  Search01Icon,
  Settings01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";

import { Tooltip } from "#components/Tooltips/ToolTip";

import { notificationsApi } from "@/api/dashboard/notificationsApi";
import { notificationKeys } from "@components/layout/dashboard/notifications";
import { toastError } from "@/lib/toast";

import type { AppNotification } from "@/types/api/dashboard/notification";

const TABS = ["Inbox", "Unread", "Comments"] as const;
type Tab = (typeof TABS)[number];

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60_000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;

  return `${Math.round(hours / 24)}d`;
}

interface SidebarNotificationsProps {
  onClose: () => void;
}

/**
 * The bell's popover: inbox, unread and comments, with a search field.
 *
 * Same data as the navbar's full-height sheet, in a box small enough to open
 * from the footer. Unread is a filter over the same list rather than a
 * separate request.
 */
export function SidebarNotifications({ onClose }: SidebarNotificationsProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<Tab>("Inbox");
  const [query, setQuery] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: notificationKeys.all,
    queryFn: () => notificationsApi.listNotifications(),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
    onError: toastError,
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
    onError: toastError,
  });

  const all: AppNotification[] = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const scoped =
    tab === "Unread"
      ? all.filter((item) => !item.isRead)
      : tab === "Comments"
        ? all.filter(
            (item) => item.type === "COMMENT_ADDED" || item.type === "MENTION",
          )
        : all;

  const needle = query.trim().toLowerCase();
  const rows = needle
    ? scoped.filter(
        (item) =>
          item.title.toLowerCase().includes(needle) ||
          item.message.toLowerCase().includes(needle),
      )
    : scoped;

  const open = (notification: AppNotification) => {
    if (!notification.isRead) markRead.mutate(notification.id);

    onClose();

    if (notification.boardId) {
      navigate(`/boards/${notification.boardId}`);
      return;
    }

    if (notification.workspaceId) {
      navigate(`/workspaces/${notification.workspaceId}`);
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Notifications"
      className="absolute bottom-full left-3 z-80 mb-2 w-84 overflow-hidden rounded-xl border border-orange-50/20 bg-[#141416]"
    >
      <div className="flex items-center gap-1 border-b border-orange-50/10 px-2 py-1.5">
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
                  ? "text-neutral-100"
                  : "text-neutral-500 hover:bg-white/4 hover:text-neutral-200",
              ].join(" ")}
            >
              {option}
              {active && (
                <span className="absolute inset-x-2 -bottom-1.75 h-0.5 rounded-full bg-orange-100" />
              )}
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-0.5">
          {unreadCount > 0 && (
            <Tooltip label="Mark all read" side="top" shape="solid" size="sm">
              <button
                type="button"
                onClick={() => markAllRead.mutate()}
                aria-label="Mark all read"
                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors duration-200 hover:bg-white/6 hover:text-neutral-200"
              >
                <HugeiconsIcon icon={Tick02Icon} size={14} strokeWidth={1.7} />
              </button>
            </Tooltip>
          )}

          <Tooltip label="Preferences" side="top" shape="solid" size="sm">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate("/settings");
              }}
              aria-label="Notification preferences"
              className="flex size-7 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors duration-200 hover:bg-white/6 hover:text-neutral-200"
            >
              <HugeiconsIcon
                icon={Settings01Icon}
                size={14}
                strokeWidth={1.6}
              />
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-orange-50/10 px-2.5 py-2">
        <div className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-lg border border-orange-50/15 bg-white/3 px-2.5">
          <HugeiconsIcon
            icon={Search01Icon}
            size={13}
            strokeWidth={1.6}
            className="shrink-0 text-neutral-500"
          />

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search notifications"
            aria-label="Search notifications"
            className="min-w-0 flex-1 bg-transparent text-[12px] tracking-tight text-neutral-100 placeholder:text-neutral-600 outline-hidden"
          />
        </div>

        <button
          type="button"
          onClick={() => setTab(tab === "Unread" ? "Inbox" : "Unread")}
          className={[
            "flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-lg border px-2.5 text-[11.5px] transition-colors duration-200",
            tab === "Unread"
              ? "border-orange-50/30 text-orange-100"
              : "border-orange-50/15 text-neutral-400 hover:border-orange-50/30 hover:text-neutral-100",
          ].join(" ")}
        >
          <HugeiconsIcon icon={Add01Icon} size={12} strokeWidth={2} />
          Filter
        </button>
      </div>

      <div className="max-h-72 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-px">
            {[0, 1, 2].map((row) => (
              <div key={row} className="flex gap-3 px-3.5 py-3">
                <div className="size-7 shrink-0 animate-pulse rounded-full bg-white/6" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-2.5 w-24 animate-pulse rounded bg-white/6" />
                  <div className="h-2.5 w-full animate-pulse rounded bg-white/4" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <p className="px-3.5 py-10 text-center text-[12px] text-rose-300">
            Could not load notifications
          </p>
        ) : rows.length === 0 ? (
          <div className="px-3.5 py-12 text-center">
            <span className="mx-auto flex size-10 items-center justify-center rounded-full border border-orange-50/15 text-neutral-600">
              <HugeiconsIcon icon={Message01Icon} size={17} strokeWidth={1.6} />
            </span>

            <p className="mt-3 text-[12.5px] text-neutral-400">
              {needle
                ? `Nothing matches “${query.trim()}”`
                : tab === "Comments"
                  ? "No new comments"
                  : tab === "Unread"
                    ? "You're all caught up"
                    : "No notifications yet"}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-orange-50/6">
            {rows.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => open(item)}
                  className="flex w-full cursor-pointer items-start gap-3 px-3.5 py-3 text-left transition-colors duration-200 hover:bg-white/4"
                >
                  <span
                    aria-hidden="true"
                    className={[
                      "mt-1.5 size-1.5 shrink-0 rounded-full",
                      item.isRead ? "bg-neutral-700" : "bg-orange-100",
                    ].join(" ")}
                  />

                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="min-w-0 truncate text-[12px] font-medium tracking-tight text-neutral-100">
                        {item.title}
                      </span>

                      <time
                        dateTime={item.createdAt}
                        className="shrink-0 font-mono text-[9px] tabular-nums text-neutral-600"
                      >
                        {relativeTime(item.createdAt)}
                      </time>
                    </span>

                    <span className="mt-1 block text-[11.5px] leading-5 text-neutral-400">
                      {item.message}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default SidebarNotifications;
