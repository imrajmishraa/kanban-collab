import { LayoutDashboard, PanelsTopLeft, Users } from "lucide-react";

import SidebarItem from "@components/ui/dashboard/SidebarItem";

interface SidebarNavigationProps {
  collapsed: boolean;
}

const SidebarNavigation = ({ collapsed }: SidebarNavigationProps) => {
  return (
    <nav className="px-3 pt-4">
      <SidebarItem
        label="Overview"
        href="/dashboard"
        icon={<LayoutDashboard className="size-4" />}
        collapsed={collapsed}
      />

      <SidebarItem
        label="Boards"
        href="/boards"
        icon={<PanelsTopLeft className="size-4" />}
        collapsed={collapsed}
      />

      <SidebarItem
        label="Members"
        href="/members"
        icon={<Users className="size-4" />}
        collapsed={collapsed}
      />
    </nav>
  );
};

export default SidebarNavigation;
