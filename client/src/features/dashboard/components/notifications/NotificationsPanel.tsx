import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

import { notificationsApi } from "@/features/dashboard/api/notificationsApi";
import { toastSuccess, toastError } from "@/lib/toast";

import type { AppNotification } from "@/types/notification";
import { notificationKeys } from "./index";

import { NotificationRow } from "./NotificationRow";

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
  /**
   * The trigger's container. Clicks inside it must not count as "outside",
   * or the button cannot close the panel it opened: the document
   * `pointerdown` fires before the button's `click`, so the panel would close
   * and immediately reopen.
   */
  ignoreRef?: RefObject<HTMLElement | null>;
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-4 pb-1 pt-4 text-[11px] font-medium text-(--text-muted)">
      {children}
    </p>
  );
}

/**
 * The bell's feed, as a full-height sheet under the navbar.
 *
 * Portalled to `document.body`: the panel is rendered inside the navbar, which
 * is `fixed z-50` and therefore establishes a stacking context. A descendant
 * can never paint above its own stacking context's level, so raising its
 * z-index in place did nothing. Escaping the header puts it in the root
 * context, where `z-[90]` sits above the navbar (50) and the sidebar (40) and
 * below the modals and search palette (100).
 */
export default function NotificationsPanel({
  open,
  onClose,
  ignoreRef,
}: NotificationsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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
    onError: toastError,
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: invalidate,
    onError: toastError,
  });

  const clearOne = useMutation({
    mutationFn: (id: string) => notificationsApi.clear(id),
    onSuccess: invalidate,
    onError: toastError,
  });

  const clearAll = useMutation({
    mutationFn: () => notificationsApi.clearAll({ readOnly: true }),
    onSuccess: (result) => {
      invalidate();
      toastSuccess("Cleared", `${result.deleted} read notifications removed.`);
    },
    onError: toastError,
  });

  const muteType = useMutation({
    mutationFn: (type: AppNotification["type"]) =>
      notificationsApi.muteType(type),
    onSuccess: () => {
      toastSuccess("Muted", "This notification type is off in app.");
    },
    onError: toastError,
  });

  useEffect(() => {
    if (!open) return;

    const onDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (panelRef.current?.contains(target)) return;
      if (ignoreRef?.current?.contains(target)) return;

      onClose();
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
  }, [open, onClose, ignoreRef]);

  if (!open) return null;

  const notifications: AppNotification[] = data?.notifications ?? [];
  const unread = notifications.filter((n) => !n.isRead);
  const read = notifications.filter((n) => n.isRead);

  /** Rows are links: open the board the notification is about. */
  const openNotification = (notification: AppNotification) => {
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

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Notifications"
      className="fixed right-0 top-14 mr-5 mb-1 rounded-2xl bottom-0 z-90 flex w-90 max-w-[calc(100vw-1rem)] flex-col border border-(--hairline) bg-(--bg-root)/95 backdrop-blur-sm motion-safe:animate-in motion-safe:slide-in-from-right-2 motion-safe:fade-in-0 motion-safe:duration-200"
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-(--hairline) px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-[13px] font-medium tracking-tight text-(--text-primary)">
            Notifications
          </span>
          {unread.length > 0 && (
            <span className="shrink-0 rounded-full border border-(--accent-soft) bg-(--accent-soft) px-1.5 py-0.5 text-[10px] font-medium text-(--accent)">
              {unread.length > 9 ? "9+" : unread.length}
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending || unread.length === 0}
            className="rounded-md px-2 py-1 text-[11px] text-(--text-secondary) transition-colors duration-200 hover:bg-(--bg-hover) hover:text-(--text-primary) disabled:cursor-not-allowed disabled:opacity-40"
          >
            Mark all read
          </button>

          <button
            type="button"
            onClick={() => clearAll.mutate()}
            disabled={clearAll.isPending || read.length === 0}
            className="rounded-md px-2 py-1 text-[11px] text-(--text-secondary) transition-colors duration-200 hover:bg-(--bg-hover) hover:text-(--text-primary) disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear read
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close notifications"
            className="rounded-md p-1.5 text-(--text-muted) transition-colors duration-200 hover:bg-(--bg-hover) hover:text-(--text-primary)"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={1.8} />
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-3">
            {[0, 1, 2, 3].map((row) => (
              <div
                key={row}
                className="h-16 animate-pulse rounded-lg bg-(--tint-5)"
              />
            ))}
          </div>
        ) : isError ? (
          <p className="px-4 py-10 text-center text-[12px] text-(--danger)">
            Could not load notifications.
          </p>
        ) : notifications.length === 0 ? (
          <p className="px-4 py-10 text-center text-[12px] text-(--text-muted)">
            You are all caught up
          </p>
        ) : (
          <>
            {unread.length > 0 && (
              <>
                <SectionLabel>New</SectionLabel>
                {unread.map((notification) => (
                  <NotificationRow
                    key={notification.id}
                    notification={notification}
                    onOpen={openNotification}
                    onMarkRead={(id) => markRead.mutate(id)}
                    onClear={(id) => clearOne.mutate(id)}
                    onMute={(type) => muteType.mutate(type)}
                  />
                ))}
              </>
            )}

            {read.length > 0 && (
              <>
                <SectionLabel>
                  {unread.length > 0 ? "Earlier" : "Notifications"}
                </SectionLabel>
                {read.map((notification) => (
                  <NotificationRow
                    key={notification.id}
                    notification={notification}
                    onOpen={openNotification}
                    onMarkRead={(id) => markRead.mutate(id)}
                    onClear={(id) => clearOne.mutate(id)}
                    onMute={(type) => muteType.mutate(type)}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
