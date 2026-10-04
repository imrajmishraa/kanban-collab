import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare02Icon,
  KanbanIcon,
  Note01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

import SidebarItem from "@components/ui/dashboard/SidebarItem";

interface SidebarNavigationProps {
  collapsed: boolean;
}

const SidebarNavigation = ({ collapsed }: SidebarNavigationProps) => {
  return (
    <nav
      aria-label="Main navigation"
      className="border-b border-white/6 px-3 py-3"
    >
      <div className="flex flex-col gap-0.5">
        <SidebarItem
          label="Overview"
          href="/dashboard"
          icon={
            <HugeiconsIcon
              icon={DashboardSquare02Icon}
              size={16}
              strokeWidth={1.5}
            />
          }
          collapsed={collapsed}
        />

        <SidebarItem
          label="Boards"
          href="/boards"
          icon={<HugeiconsIcon icon={KanbanIcon} size={16} strokeWidth={1.5} />}
          collapsed={collapsed}
        />

        <SidebarItem
          label="Notes"
          href="/notes"
          icon={<HugeiconsIcon icon={Note01Icon} size={16} strokeWidth={1.5} />}
          collapsed={collapsed}
        />

        <SidebarItem
          label="Members"
          href="/members"
          icon={
            <HugeiconsIcon icon={UserGroupIcon} size={16} strokeWidth={1.5} />
          }
          collapsed={collapsed}
        />
      </div>
    </nav>
  );
};

export default SidebarNavigation;
