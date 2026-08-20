import { LogOut, Settings, UserCircle } from "lucide-react";

import SidebarItem from "@components/ui/dashboard/SidebarItem";
import type { AuthUser } from "@/types/api/auth/auth";
import { useNavigate } from "react-router-dom";

interface SidebarFooterProps {
  collapsed: boolean;
  user: AuthUser | null;
  onLogout: () => Promise<void>;
}

const SidebarFooter = ({ collapsed, user, onLogout }: SidebarFooterProps) => {
  if (!user) {
    return (
      <footer className="border-t border-neutral-800 p-3">
        <div className="flex items-center justify-center">
          <div className="flex size-8 items-center justify-center border border-neutral-800 bg-[#0c0c0e] font-mono text-xs text-neutral-600">
            ?
          </div>
        </div>
      </footer>
    );
  }

  const navigate = useNavigate();

  const initials = user.fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    void onLogout();
  };

  /*
   * Collapsed sidebar
   */
  if (collapsed) {
    return (
      <footer className="mt-auto border-t border-neutral-800 p-3">
        <div className="flex flex-col items-center gap-2">
          <SidebarItem
            label="Settings"
            href="/settings"
            icon={<Settings className="size-4" />}
            collapsed={collapsed}
          />
          {/* User avatar */}
          <button
            type="button"
            title={user.fullName}
            onClick={(event) => {
              event.stopPropagation();
              navigate("/user/profile");
            }}
            className="flex size-9 cursor-pointer items-center justify-center border border-neutral-700 bg-white/3 font-mono text-xs font-semibold text-neutral-300 transition-colors hover:border-neutral-600 hover:bg-white/5 hover:text-white"
          >
            {initials}
          </button>

          {/* Logout */}
          <button
            type="button"
            title="Log out"
            onClick={(event) => {
              event.stopPropagation();
              void onLogout();
            }}
            className="flex size-9 items-center justify-center text-neutral-600 transition-colors hover:bg-white/3 hover:text-red-400 cursor-pointer"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </footer>
    );
  }

  /*
   * Expanded sidebar
   */
  return (
    <footer className="mt-auto border-t border-neutral-800 p-3">
      <SidebarItem
        label="Settings"
        href="/settings"
        icon={<Settings className="size-4" />}
        collapsed={false}
      />

      <SidebarItem
        label="Profile"
        href="/user/profile"
        icon={<UserCircle className="size-4" />}
        collapsed={false}
      />

      <div className="my-3 border-t border-neutral-800" />

      {/* User information */}
      <div className="flex items-center gap-3 px-2">
        <div
          className="flex size-8 shrink-0 items-center justify-center border border-neutral-700 bg-white/3 font-mono text-xs font-semibold text-neutral-300"
          title={user.fullName}
        >
          {initials}
        </div>

        <div className="min-w-0">
          <p className="truncate font-mono text-xs text-neutral-200">
            {user.fullName}
          </p>

          <p className="truncate font-mono text-[10px] text-neutral-600">
            {user.email}
          </p>
        </div>
      </div>

      {/* Logout */}
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          handleLogout();
        }}
        className="mt-3 flex h-9 w-full cursor-pointer items-center gap-3 px-3 font-mono text-xs text-neutral-500 transition-colors hover:bg-white/3 hover:text-red-400"
      >
        <LogOut className="size-4 shrink-0" />

        <span>Log out</span>
      </button>
    </footer>
  );
};

export default SidebarFooter;
