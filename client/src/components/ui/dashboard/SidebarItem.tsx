import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

interface SidebarItemProps {
  label: string;
  href: string;
  icon: ReactNode;
  collapsed: boolean;
}

const SidebarItem = ({ label, href, icon, collapsed }: SidebarItemProps) => {
  return (
    <NavLink
      to={href}
      onClick={(event) => {
        event.stopPropagation();
      }}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        [
          "group flex h-9 items-center gap-3 px-3",
          "border-l text-sm font-mono",
          "transition-colors duration-150",
          isActive
            ? "border-rose-500 bg-white/4 text-white"
            : "border-transparent text-neutral-500 hover:bg-white/2.5 hover:text-neutral-200",
          collapsed ? "justify-center px-0" : "",
        ].join(" ")
      }
    >
      <span className="flex size-4 shrink-0 items-center justify-center">
        {icon}
      </span>

      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
};

export default SidebarItem;
