import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import { BellIcon } from "@hugeicons/core-free-icons";

import { WorkspaceSelector } from "../selector/WorkspaceSelector";
import { NavbarSearchIcon } from "./NavbarSearchIcon";
import { useActiveWorkspace } from "@/stores/activeWorkspace";
import { useSidebarState } from "@/stores/sidebarState";

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
        <WorkspaceSelector
          activeWorkspaceId={activeWorkspaceId ?? null}
          activeWorkspaceName={activeWorkspaceName ?? null}
          onWorkspaceChange={setActiveWorkspace}
        />

        {sidebarCollapsed && <NavbarSearchIcon />}

        <div className="ml-auto flex items-center gap-1">
          <NotificationsButton onClick={() => navigate("/notifications")} />
        </div>
      </header>
    </>
  );
}

function NotificationsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Notifications"
      className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-white/8 bg-white/4 text-(--text-secondary) transition-colors duration-200 hover:border-white/14 hover:bg-white/8 hover:text-(--text-primary)"
    >
      <HugeiconsIcon icon={BellIcon} size={16} strokeWidth={1.6} />
    </button>
  );
}
