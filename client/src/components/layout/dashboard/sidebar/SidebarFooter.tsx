import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { HugeiconsIcon } from "@hugeicons/react";
import { BellIcon, MoreHorizontalIcon } from "@hugeicons/core-free-icons";

import { Avatar } from "@components/layout/board/BoardAvatar";
import { Tooltip } from "@components/Tooltips/ToolTip";
import { notificationKeys } from "@components/layout/dashboard/notifications";

import SidebarAccountMenu from "./SidebarAccountMenu";
import SidebarNotifications from "./SidebarNotifications";

import { avatarColor } from "@/features/boards/board.helpers";
import { notificationsApi } from "@/api/dashboard/notificationsApi";

import type { AuthUser } from "@/types/api/auth/auth";

interface SidebarFooterProps {
  collapsed: boolean;
  user: AuthUser | null;
  onLogout: () => Promise<void>;
}

type Panel = "account" | "notifications" | null;

/**
 * Who you are, with the two controls the reference puts beside the name:
 * a three-dots account menu and a bell that opens notifications in place.
 *
 * Both open upward as popovers so they never push the nav around, and either
 * one closes on Escape, an outside click, or a route change.
 */
export default function SidebarFooter({
  collapsed,
  user,
  onLogout,
}: SidebarFooterProps) {
  const [panel, setPanel] = useState<Panel>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: notificationKeys.all,
    queryFn: () => notificationsApi.listNotifications(),
    // The bell only needs a number; a stale count for a minute is fine and
    // saves a request on every sidebar mount.
    staleTime: 60_000,
  });

  const unread = data?.unreadCount ?? 0;

  useEffect(() => {
    if (!panel) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setPanel(null);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPanel(null);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [panel]);

  const toggle = (next: Exclude<Panel, null>) =>
    setPanel((current) => (current === next ? null : next));

  if (collapsed) {
    return (
      <div
        ref={containerRef}
        className="relative flex shrink-0 flex-col items-center gap-1 border-t border-orange-50/15 py-3"
      >
        {panel === "account" && (
          <SidebarAccountMenu
            user={user}
            onLogout={onLogout}
            onClose={() => setPanel(null)}
          />
        )}

        {panel === "notifications" && (
          <SidebarNotifications onClose={() => setPanel(null)} />
        )}

        <Tooltip label="Account" side="right" shape="solid" size="sm">
          <button
            type="button"
            onClick={() => toggle("account")}
            aria-label="Account"
            aria-expanded={panel === "account"}
            className="flex size-9 cursor-pointer items-center justify-center rounded-lg transition-colors duration-200 hover:bg-white/6"
          >
            <Avatar
              member={{
                id: user?.id ?? "me",
                name: user?.fullName,
                avatarUrl: user?.avatarUrl ?? null,
                color: avatarColor(user?.id ?? "me"),
              }}
              size={26}
              ring={false}
            />
          </button>
        </Tooltip>

        <Tooltip label="Notifications" side="right" shape="solid" size="sm">
          <button
            type="button"
            onClick={() => toggle("notifications")}
            aria-label="Notifications"
            aria-expanded={panel === "notifications"}
            className="relative flex size-8 cursor-pointer items-center justify-center rounded-lg text-neutral-500 transition-colors duration-200 hover:bg-white/6 hover:text-neutral-200"
          >
            <HugeiconsIcon icon={BellIcon} size={15} strokeWidth={1.6} />
            {unread > 0 && (
              <span className="absolute right-1 top-1 size-1.5 rounded-full bg-orange-100" />
            )}
          </button>
        </Tooltip>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative shrink-0 border-t border-orange-50/15 px-3 py-3"
    >
      {panel === "account" && (
        <SidebarAccountMenu
          user={user}
          onLogout={onLogout}
          onClose={() => setPanel(null)}
        />
      )}

      {panel === "notifications" && (
        <SidebarNotifications onClose={() => setPanel(null)} />
      )}

      <div className="flex items-center gap-2">
        <Avatar
          member={{
            id: user?.id ?? "me",
            name: user?.fullName,
            avatarUrl: user?.avatarUrl ?? null,
            color: avatarColor(user?.id ?? "me"),
          }}
          size={26}
          ring={false}
        />

        <p className="min-w-0 flex-1 truncate text-[12.5px] font-medium tracking-tight text-neutral-100">
          {user?.fullName ?? "Account"}
        </p>

        <button
          type="button"
          onClick={() => toggle("account")}
          aria-label="Account menu"
          aria-expanded={panel === "account"}
          className={[
            "flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors duration-200",
            panel === "account"
              ? "border-orange-50/30 bg-white/8 text-neutral-100"
              : "border-orange-50/15 text-neutral-400 hover:border-orange-50/30 hover:bg-white/5 hover:text-neutral-100",
          ].join(" ")}
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} size={14} strokeWidth={2} />
        </button>

        <button
          type="button"
          onClick={() => toggle("notifications")}
          aria-label={
            unread > 0 ? `Notifications (${unread} unread)` : "Notifications"
          }
          aria-expanded={panel === "notifications"}
          className={[
            "relative flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors duration-200",
            panel === "notifications"
              ? "border-orange-50/30 bg-white/8 text-neutral-100"
              : "border-orange-50/15 text-neutral-400 hover:border-orange-50/30 hover:bg-white/5 hover:text-neutral-100",
          ].join(" ")}
        >
          <HugeiconsIcon icon={BellIcon} size={13} strokeWidth={1.7} />

          {unread > 0 && (
            <span
              aria-hidden="true"
              className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-orange-100"
            />
          )}
        </button>
      </div>
    </div>
  );
}
