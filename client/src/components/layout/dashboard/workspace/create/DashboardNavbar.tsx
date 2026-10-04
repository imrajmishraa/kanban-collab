import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { WorkspaceSelector } from "../selector/WorkspaceSelector";
import { RecentBoardsMenu } from "./RecentBoardsMenu";
import { useActiveWorkspace } from "@/stores/activeWorkspace";
import { useSidebarState } from "@/stores/sidebarState";
import {
  Chevron,
  DashIcon,
  NavbarSearchIcon,
  NotificationsButton,
} from "./NavbarIcons";

export default function DashboardNavbar() {
  const navigate = useNavigate();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

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

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />

      <header
        className={[
          "sticky top-0 z-30 hidden h-14 shrink-0 items-center gap-2 px-5 md:flex",
          "transition-colors duration-200",
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

        <div className="ml-auto flex items-center gap-1">
          {sidebarCollapsed && <NavbarSearchIcon />}
          <NotificationsButton onClick={() => navigate("/notifications")} />
        </div>
      </header>
    </>
  );
}
