import { useEffect, useRef, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { WorkspaceSelector } from "../workspace/selector/WorkspaceSelector";
import { RecentBoardsMenu } from "../workspace/create/RecentBoardsMenu";
import { notificationKeys } from "../notifications/index";
import { useActiveWorkspace } from "@/stores/activeWorkspace";
import { useSidebarState } from "@/stores/sidebarState";
import { notificationsApi } from "@/api/dashboard/notificationsApi";
import {
  Chevron,
  DashIcon,
  NavbarSearchIcon,
  NotificationsButton,
} from "../workspace/create/NavbarIcons";
import NotificationsPanel from "../notifications/NotificationsPanel";

export default function DashboardNavbar() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const { activeWorkspaceId, activeWorkspaceName, setActiveWorkspace } =
    useActiveWorkspace();

  const sidebarCollapsed = useSidebarState((s) => s.collapsed);

  // Lightweight poll for the unread badge. The panel reuses the same key.
  const { data: notificationsData } = useQuery({
    queryKey: notificationKeys.all,
    queryFn: () => notificationsApi.listNotifications(),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />

      <header
        className={[
          "fixed top-0 right-0 z-50 hidden h-14 md:flex",
          "items-center gap-2 px-5 ",
          "transition-[left,background-color] duration-200",
          sidebarCollapsed ? "left-16" : "left-54",
          scrolled ? "bg-(--bg-root)/85 backdrop-blur-md" : "bg-transparent",
        ].join(" ")}
      >
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 items-center gap-0.5"
        >
          <DashIcon />

          <Chevron />

          <WorkspaceSelector
            activeWorkspaceId={activeWorkspaceId ?? null}
            activeWorkspaceName={activeWorkspaceName ?? null}
            onWorkspaceChange={setActiveWorkspace}
          />

          <Chevron />

          {/* Remounts on workspace change, which also closes its menu. */}
          <RecentBoardsMenu key={activeWorkspaceId ?? "none"} />
        </nav>

        <div className="ml-auto flex items-center justify-end gap-1">
          {sidebarCollapsed && <NavbarSearchIcon />}

          <div className="relative">
            <NotificationsButton
              unreadCount={notificationsData?.unreadCount ?? 0}
              onClick={() => setNotificationsOpen((open) => !open)}
            />
            <NotificationsPanel
              open={notificationsOpen}
              onClose={() => setNotificationsOpen(false)}
            />
          </div>
        </div>
      </header>
    </>
  );
}
