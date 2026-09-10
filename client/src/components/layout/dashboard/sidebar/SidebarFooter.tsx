import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

export default function SidebarMore({
  collapsed,
  user,
  onLogout,
  mobile = false,
}: SidebarMoreProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleProfile = () => {
    navigate("/profile");

    if (mobile) {
      setMobileOpen(false);
    }
  };

  const handleSettings = () => {
    navigate("/settings");

    if (mobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = async () => {
    setMobileOpen(false);
    await onLogout();
  };

  /*
   * ─────────────────────────────────────────────
   * Collapsed desktop sidebar
   * ─────────────────────────────────────────────
   *
   * More button stays at the bottom.
   * Menu opens to the right on hover.
   */
  if (collapsed && !mobile) {
    return (
      <div className="group relative shrink-0 border-t border-(--border) py-3">
        {/* Collapsed More Menu */}
        <div
          className="
            absolute bottom-0 left-full z-50 hidden w-60 pl-2
            group-hover:block
          "
          role="menu"
        >
          <div
            className="
              overflow-hidden
              rounded-lg
              border border-(--border)
              bg-(--bg-surface)
              shadow-[12px_12px_30px_rgba(0,0,0,0.45)]
            "
          >
            {/* User Details */}
            <div className="border-b border-(--border) px-3 py-3">
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex size-8 shrink-0 items-center justify-center
                    rounded-md
                    border border-(--border-strong)
                    bg-(--surface-elevated)
                  "
                >
                  <HugeiconsIcon
                    icon={UserIcon}
                    size={16}
                    strokeWidth={1.5}
                    className="text-(--text-secondary)"
                  />
                </div>

                <div className="min-w-0">
                  <p className="truncate font-mono text-xs text-(--text-primary)">
                    {user?.fullName ?? "User"}
                  </p>

                  <p className="truncate font-mono text-[10px] text-(--text-muted)">
                    {user?.email ?? ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile */}
            <button
              type="button"
              role="menuitem"
              onClick={handleProfile}
              className="
                flex w-full cursor-pointer items-center gap-3
                border border-transparent
                px-3 py-2.5
                text-left font-mono text-[11px]
                text-(--text-secondary)
                transition-all duration-150
                hover:border-(--brand)
                hover:bg-(--brand-muted)
                hover:text-(--text-primary)
              "
            >
              <HugeiconsIcon
                icon={UserIcon}
                size={16}
                strokeWidth={1.5}
                className="shrink-0"
              />

              <span>Profile</span>
            </button>

            {/* Settings */}
            <button
              type="button"
              role="menuitem"
              onClick={handleSettings}
              className="
                flex w-full cursor-pointer items-center gap-3
                border border-transparent
                px-3 py-2.5
                text-left font-mono text-[11px]
                text-(--text-secondary)
                transition-all duration-150
                hover:border-(--brand)
                hover:bg-(--brand-muted)
                hover:text-(--text-primary)
              "
            >
              <HugeiconsIcon
                icon={Settings01Icon}
                size={16}
                strokeWidth={1.5}
                className="shrink-0"
              />

              <span>Settings</span>
            </button>

            {/* Logout */}
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="
                flex w-full cursor-pointer items-center gap-3
                border-t border-(--border)
                border-x border-transparent
                px-3 py-2.5
                text-left font-mono text-[11px]
                text-(--text-secondary)
                transition-all duration-150
                hover:border-(--danger)
                hover:bg-[rgba(241,107,122,0.08)]
                hover:text-(--danger)
              "
            >
              <HugeiconsIcon
                icon={Logout01Icon}
                size={16}
                strokeWidth={1.5}
                className="shrink-0"
              />

              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Collapsed More Button */}
        <button
          type="button"
          title="More"
          aria-label="More"
          className="
            mx-auto flex size-9 cursor-pointer items-center justify-center
            rounded-md
            border border-transparent
            text-(--text-secondary)
            transition-all duration-150
            hover:border-(--brand)
            hover:bg-(--brand-muted)
            hover:text-(--text-primary)
          "
        >
          <HugeiconsIcon
            icon={Menu01Icon}
            size={16}
            strokeWidth={1.5}
          />
        </button>
      </div>
    );
  }

  /*
   * ─────────────────────────────────────────────
   * Expanded desktop + mobile
   * ─────────────────────────────────────────────
   */
  return (
    <div className="group relative shrink-0 border-t border-(--border) px-3 py-3">
      {/* More Menu */}
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
        <div
          className="
            overflow-hidden
            rounded-lg
            border border-(--border)
            bg-(--bg-surface)
            shadow-[0_12px_30px_rgba(0,0,0,0.45)]
          "
        >
          {/* User Details */}
          <div className="border-b border-(--border) px-3 py-3">
            <div className="flex items-center gap-3">
              <div
                className="
                  flex size-8 shrink-0 items-center justify-center
                  rounded-md
                  border border-(--border-strong)
                  bg-(--surface-elevated)
                "
              >
                <HugeiconsIcon
                  icon={UserIcon}
                  size={16}
                  strokeWidth={1.5}
                  className="text-(--text-secondary)"
                />
              </div>

              <div className="min-w-0">
                <p className="truncate font-mono text-xs text-(--text-primary)">
                  {user?.fullName ?? "User"}
                </p>

                <p className="truncate font-mono text-[10px] text-(--text-muted)">
                  {user?.email ?? ""}
                </p>
              </div>
            </div>
          </div>

          {/* Profile */}
          <button
            type="button"
            role="menuitem"
            onClick={handleProfile}
            className="
              flex w-full cursor-pointer items-center gap-3
              border border-transparent
              px-3 py-2.5
              text-left font-mono text-[11px]
              text-(--text-secondary)
              transition-all duration-150
              hover:border-(--brand)
              hover:bg-(--brand-muted)
              hover:text-(--text-primary)
            "
          >
            <HugeiconsIcon
              icon={UserIcon}
              size={16}
              strokeWidth={1.5}
              className="shrink-0"
            />

            <span>Profile</span>
          </button>

          {/* Settings */}
          <button
            type="button"
            role="menuitem"
            onClick={handleSettings}
            className="
              flex w-full cursor-pointer items-center gap-3
              border border-transparent
              px-3 py-2.5
              text-left font-mono text-[11px]
              text-(--text-secondary)
              transition-all duration-150
              hover:border-(--brand)
              hover:bg-(--brand-muted)
              hover:text-(--text-primary)
            "
          >
            <HugeiconsIcon
              icon={Settings01Icon}
              size={16}
              strokeWidth={1.5}
              className="shrink-0"
            />

            <span>Settings</span>
          </button>

          {/* Logout */}
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="
              flex w-full cursor-pointer items-center gap-3
              border-t border-(--border)
              border-x border-transparent
              px-3 py-2.5
              text-left font-mono text-[11px]
              text-(--text-secondary)
              transition-all duration-150
              hover:border-(--danger)
              hover:bg-[rgba(241,107,122,0.08)]
              hover:text-(--danger)
            "
          >
            <HugeiconsIcon
              icon={Logout01Icon}
              size={16}
              strokeWidth={1.5}
              className="shrink-0"
            />

            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* More Button */}
      <button
        type="button"
        onClick={() => {
          if (mobile) {
            setMobileOpen((previous) => !previous);
          }
        }}
        className="
          flex w-full cursor-pointer items-center justify-between
          rounded-md
          border border-transparent
          px-2 py-2
          text-left
          transition-all duration-150
          hover:border-(--brand)
          hover:bg-(--brand-muted)
        "
        aria-expanded={mobile ? mobileOpen : undefined}
        aria-haspopup="menu"
      >
        <div className="flex items-center gap-3">
          <HugeiconsIcon
            icon={Menu01Icon}
            size={16}
            strokeWidth={1.5}
            className="
              shrink-0
              text-(--text-secondary)
              transition-colors duration-150
            "
          />

          <span
            className="
              font-mono text-[10px] font-semibold
              tracking-[0.18em]
              text-(--text-secondary)
            "
          >
            MORE
          </span>
        </div>
      </button>
    </div>
  );
};

