import { useEffect, useRef } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { notificationsApi } from "@/api/dashboard/notificationsApi";

import type { AppNotification } from "@/types/api/dashboard/notification";
import { notificationKeys } from ".";

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

/**
 * The bell's dropdown — the in-app notification feed. Replaces the previous
 * dead `/notifications` navigation with a component that reads the real
 * notifications API.
 */
export default function NotificationsPanel({
  open,
  onClose,
}: NotificationsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: notificationKeys.all,
    queryFn: () => notificationsApi.listNotifications(),
    enabled: open,
    refetchOnWindowFocus: false,
  });

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: notificationKeys.all });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: invalidate,
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: invalidate,
  });

  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const notifications: AppNotification[] = data?.notifications ?? [];

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Notifications"
      className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-white/10 bg-(--bg-elevated) shadow-[0_16px_40px_-12px_rgba(0,0,0,0.7)]"
    >
      <header className="flex items-center justify-between border-b border-white/8 px-3.5 py-2.5">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-(--text-primary)">
          Notifications
        </span>
        <button
          type="button"
          onClick={() => markAllRead.mutate()}
          disabled={markAllRead.isPending || notifications.length === 0}
          className="font-mono text-[10px] uppercase tracking-wider text-(--text-muted) transition-colors hover:text-(--text-primary) disabled:opacity-40"
        >
          Mark all read
        </button>
      </header>

      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-3">
            {[0, 1, 2].map((row) => (
              <div
                key={row}
                className="h-12 animate-pulse rounded-lg bg-white/6"
              />
            ))}
          </div>
        ) : isError ? (
          <p className="px-4 py-8 text-center font-mono text-[11px] text-(--text-muted)">
            Couldn't load notifications.
          </p>
        ) : notifications.length === 0 ? (
          <p className="px-4 py-8 text-center font-mono text-[11px] text-(--text-muted)">
            You're all caught up.
          </p>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() =>
                !notification.isRead && markRead.mutate(notification.id)
              }
              className={[
                "flex w-full items-start gap-2.5 border-b border-white/6 px-3.5 py-3 text-left transition-colors hover:bg-white/4",
                notification.isRead ? "opacity-60" : "",
              ].join(" ")}
            >
              <span
                aria-hidden="true"
                className={[
                  "mt-1.5 size-1.5 shrink-0 rounded-full",
                  notification.isRead ? "bg-white/20" : "bg-(--brand)",
                ].join(" ")}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-mono text-[12px] font-medium text-(--text-primary)">
                  {notification.title}
                </span>
                <span className="mt-0.5 block font-mono text-[11px] leading-4 text-(--text-secondary)">
                  {notification.message}
                </span>
                <span className="mt-1 block font-mono text-[9px] uppercase tracking-wider text-(--text-muted)">
                  {formatRelative(notification.createdAt)}
                </span>
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
