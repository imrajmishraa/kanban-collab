import { useNavigate } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  LogsIcon,
  Home03Icon,
  LogoutSquare01Icon,
  Settings01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";

import { Tooltip } from "#components/Tooltips/ToolTip";

import type { AuthUser } from "@/types/api/auth/auth";

interface SidebarAccountMenuProps {
  user: AuthUser | null;
  onLogout: () => Promise<void>;
  onClose: () => void;
}

interface Row {
  label: string;
  icon: typeof UserIcon;
  onClick: () => void;
  danger?: boolean;
}

/**
 * The three-dots menu above the footer: who you are, then the account routes,
 * then log out. Anchored bottom-left so it opens upward over the nav.
 */
export function SidebarAccountMenu({
  user,
  onLogout,
  onClose,
}: SidebarAccountMenuProps) {
  const navigate = useNavigate();

  const go = (path: string) => {
    onClose();
    navigate(path);
  };

  const rows: Row[] = [
    { label: "Profile", icon: UserIcon, onClick: () => go("/user/profile") },
    {
      label: "Preferences",
      icon: Settings01Icon,
      onClick: () => go("/settings"),
    },
    { label: "Home page", icon: Home03Icon, onClick: () => go("/home") },
    {
      label: "Activity logs",
      icon: LogsIcon,
      onClick: () => go("/activity"),
    },
  ];

  return (
    <div
      role="menu"
      aria-label="Account"
      className="absolute bottom-full left-3 z-80 mb-2 w-68 overflow-hidden rounded-xl border border-orange-50/20 bg-[#141416]"
    >
      <div className="flex items-start gap-2 border-b border-orange-50/10 px-3.5 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] font-medium tracking-tight text-neutral-100">
            {user?.fullName ?? "Account"}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-neutral-500">
            {user?.email ?? ""}
          </p>
        </div>

        <Tooltip label="Preferences" side="top" shape="solid" size="sm">
          <button
            type="button"
            onClick={() => go("/settings")}
            aria-label="Preferences"
            className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors duration-200 hover:bg-white/6 hover:text-neutral-200"
          >
            <HugeiconsIcon icon={Settings01Icon} size={14} strokeWidth={1.6} />
          </button>
        </Tooltip>
      </div>

      <div className="p-1.5">
        {rows.map((row) => (
          <button
            key={row.label}
            type="button"
            role="menuitem"
            onClick={row.onClick}
            className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-left text-[12.5px] tracking-tight text-neutral-300 transition-colors duration-150 hover:bg-white/5 hover:text-neutral-100"
          >
            <span className="min-w-0 flex-1 truncate">{row.label}</span>
            <HugeiconsIcon
              icon={row.icon}
              size={14}
              strokeWidth={1.6}
              className="shrink-0 text-neutral-500"
            />
          </button>
        ))}
      </div>

      <div className="border-t border-orange-50/10 p-1.5">
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onClose();
            void onLogout();
          }}
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-left text-[12.5px] tracking-tight text-neutral-300 transition-colors duration-150 hover:bg-rose-500/8 hover:text-rose-300"
        >
          <span className="min-w-0 flex-1 truncate">Log out</span>
          <HugeiconsIcon
            icon={LogoutSquare01Icon}
            size={14}
            strokeWidth={1.6}
            className="shrink-0"
          />
        </button>
      </div>
    </div>
  );
}

export default SidebarAccountMenu;
