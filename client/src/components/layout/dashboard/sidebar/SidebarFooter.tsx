import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Logout01Icon,
  Menu01Icon,
  Settings01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";

import type { AuthUser } from "@/types/api/auth/auth";

interface SidebarMoreProps {
  collapsed: boolean;
  user: AuthUser | null;
  onLogout: () => Promise<void>;
  mobile?: boolean;
}

export default function SidebarFooter({
  collapsed,
  user,
  onLogout,
  mobile = false,
}: SidebarMoreProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(location.pathname);

  const containerRef = useRef<HTMLDivElement>(null);

  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname);
    if (mobileOpen) setMobileOpen(false);
  }

  useEffect(() => {
    if (!mobile || !mobileOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setMobileOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [mobile, mobileOpen]);

  useEffect(() => {
    if (!mobile || !mobileOpen) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobile, mobileOpen]);

  const handleProfile = () => {
    setMobileOpen(false);
    navigate("/profile");
  };

  const handleSettings = () => {
    setMobileOpen(false);
    navigate("/settings");
  };

  const handleLogout = async () => {
    setMobileOpen(false);
    await onLogout();
  };

  if (collapsed && !mobile) {
    return (
      <div className="group relative shrink-0 border-t border-white/8 py-3">
        <div
          className="absolute bottom-0 left-full z-50 hidden w-52 pl-2 group-hover:block"
          role="menu"
        >
          <div className="relative overflow-hidden rounded-lg border border-white/12 bg-(--bg-elevated) shadow-[0_12px_32px_-8px_rgba(0,0,0,0.7),0_2px_8px_-2px_rgba(0,0,0,0.4)]">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/15 to-transparent"
            />

            <div className="relative border-b border-white/6 px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/4 text-(--text-secondary)">
                  <HugeiconsIcon icon={UserIcon} size={13} strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-mono text-[11px] text-(--text-primary)">
                    {user?.fullName ?? "User"}
                  </p>
                  <p className="truncate font-mono text-[9px] text-(--text-muted)">
                    {user?.email ?? ""}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative p-1">
              <FlyoutItem
                icon={UserIcon}
                label="Profile"
                onClick={handleProfile}
              />
              <FlyoutItem
                icon={Settings01Icon}
                label="Settings"
                onClick={handleSettings}
              />
            </div>

            <div className="relative border-t border-white/6 p-1">
              <FlyoutItem
                icon={Logout01Icon}
                label="Logout"
                onClick={handleLogout}
                danger
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          title="More"
          aria-label="More"
          className="mx-auto flex size-9 cursor-pointer items-center justify-center rounded-lg text-(--text-secondary) transition-colors duration-200 hover:bg-white/4 hover:text-(--text-primary)"
        >
          <HugeiconsIcon icon={Menu01Icon} size={16} strokeWidth={1.5} />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="group relative shrink-0 border-t border-white/8 px-3 py-3"
    >
      <div
        className={[
          "absolute bottom-full left-3 right-3 z-50 overflow-hidden pb-2",
          !mobile && "hidden group-hover:block",
          mobile && (mobileOpen ? "block" : "hidden"),
        ]
          .filter(Boolean)
          .join(" ")}
        role="menu"
      >
        <div className="relative overflow-hidden rounded-lg border border-white/12 bg-(--bg-elevated) shadow-[0_-12px_32px_-8px_rgba(0,0,0,0.7),0_-2px_8px_-2px_rgba(0,0,0,0.4)]">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/15 to-transparent"
          />

          <div className="relative border-b border-white/6 px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/4 text-(--text-secondary)">
                <HugeiconsIcon icon={UserIcon} size={13} strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <p className="truncate font-mono text-[11px] text-(--text-primary)">
                  {user?.fullName ?? "User"}
                </p>
                <p className="truncate font-mono text-[9px] text-(--text-muted)">
                  {user?.email ?? ""}
                </p>
              </div>
            </div>
          </div>

          <div className="relative p-1">
            <FlyoutItem
              icon={UserIcon}
              label="Profile"
              onClick={handleProfile}
            />
            <FlyoutItem
              icon={Settings01Icon}
              label="Settings"
              onClick={handleSettings}
            />
          </div>

          <div className="relative border-t border-white/6 p-1">
            <FlyoutItem
              icon={Logout01Icon}
              label="Logout"
              onClick={handleLogout}
              danger
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          if (mobile) setMobileOpen((prev) => !prev);
        }}
        className="flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-left transition-colors duration-200 hover:bg-white/4"
        aria-expanded={mobile ? mobileOpen : undefined}
        aria-haspopup="menu"
      >
        <div className="flex items-center gap-3">
          <HugeiconsIcon
            icon={Menu01Icon}
            size={16}
            strokeWidth={1.5}
            className="shrink-0 text-(--text-secondary)"
          />
          <span className="font-mono text-[10px] font-semibold tracking-[0.18em] text-(--text-secondary)">
            MORE
          </span>
        </div>
      </button>
    </div>
  );
}


function FlyoutItem({
  icon,
  label,
  onClick,
  danger = false,
}: {
  icon: typeof UserIcon;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={[
        "flex w-full cursor-pointer items-center gap-2.5 rounded-md",
        "px-2 py-1.5 text-left font-mono text-[11px]",
        "transition-colors duration-150",
        danger
          ? "text-(--text-secondary) hover:bg-rose-500/8 hover:text-rose-300"
          : "text-(--text-secondary) hover:bg-white/5 hover:text-(--text-primary)",
      ].join(" ")}
    >
      <HugeiconsIcon
        icon={icon}
        size={13}
        strokeWidth={1.5}
        className="shrink-0"
      />
      <span>{label}</span>
    </button>
  );
}
