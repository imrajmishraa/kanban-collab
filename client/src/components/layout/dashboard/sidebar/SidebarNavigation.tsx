import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  Layout01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

import SidebarItem from "@components/ui/dashboard/SidebarItem";

interface SidebarNavigationProps {
  collapsed: boolean;
}

const SidebarNavigation = ({
  collapsed,
}: SidebarNavigationProps) => {
  return (
    <nav
      aria-label="Main navigation"
      className="px-3 pt-4"
    >
      <SidebarItem
        label="Overview"
        href="/dashboard"
        icon={
          <HugeiconsIcon
            icon={DashboardSquare01Icon}
            size={16}
            strokeWidth={1.5}
          />
        }
        collapsed={collapsed}
      />

      <SidebarItem
        label="Boards"
        href="/boards"
        icon={
          <HugeiconsIcon
            icon={Layout01Icon}
            size={16}
            strokeWidth={1.5}
          />
        }
        collapsed={collapsed}
      />

      <SidebarItem
        label="Members"
        href="/members"
        icon={
          <HugeiconsIcon
            icon={UserGroupIcon}
            size={16}
            strokeWidth={1.5}
          />
        }
        collapsed={collapsed}
      />
    </nav>
  );
};

export default SidebarNavigation;

