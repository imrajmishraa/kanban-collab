import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  LogsIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  DashboardSquare02Icon,
  KanbanIcon,
  Message01Icon,
  Note01Icon,
  Settings01Icon,
  UserGroupIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";

import SidebarItem from "@components/ui/dashboard/SidebarItem";
import { Avatar } from "@components/layout/board/BoardAvatar";

import { avatarColor } from "@/features/boards/board.helpers";
import { useActiveWorkspace } from "@/stores/activeWorkspace";
import { useWorkspaces } from "@/hooks/dashboard/useWorkspaces";

interface SidebarNavigationProps {
  collapsed: boolean;
}

interface Leaf {
  label: string;
  href: string;
  icon: typeof KanbanIcon;
}

interface DrillChild {
  label: string;
  href: string;
  icon: typeof KanbanIcon;
  /** Optional group heading, like the reference's COMPUTE and CDN. */
  section?: string;
}

interface Drilldown {
  key: string;
  label: string;
  icon: typeof KanbanIcon;
  children: DrillChild[];
}

/* The first row is the account's project list, or the selected workspace's
   own overview. It is built in the component because the label, href and icon
   all change with the selection. */
const REST: Leaf[] = [
  { label: "Boards", href: "/boards", icon: KanbanIcon },
  { label: "Notes", href: "/notes", icon: Note01Icon },
  { label: "Members", href: "/members", icon: UserGroupIcon },
];

/**
 * Rows with a chevron open a panel inside the sidebar rather than navigating:
 * the list is replaced by that section's own pages, with a back arrow and a
 * centred title, the way the reference's Observability panel works.
 */
const DRILLDOWNS: Drilldown[] = [
  {
    key: "activity",
    label: "Activity",
    icon: LogsIcon,
    children: [
      { label: "All activity", href: "/activity", icon: LogsIcon },
      {
        label: "Comments",
        href: "/activity?type=comments",
        icon: Message01Icon,
      },
      { label: "Cards", href: "/activity?type=cards", icon: KanbanIcon },
      {
        label: "Boards",
        href: "/activity?type=boards",
        icon: DashboardSquare02Icon,
      },
    ],
  },
  {
    key: "settings",
    label: "Settings",
    icon: Settings01Icon,
    children: [
      { label: "Profile", href: "/user/profile", icon: UserIcon },
      { label: "Preferences", href: "/settings", icon: Settings01Icon },
    ],
  },
];

const SidebarNavigation = ({ collapsed }: SidebarNavigationProps) => {
  const { pathname } = useLocation();
  const [openSection, setOpenSection] = useState<string | null>(null);

  const { activeWorkspaceId, activeWorkspaceName } = useActiveWorkspace();

  /* Shares the cache with the sidebar's own workspace list, so this does not
     add a request. */
  const { workspaces } = useWorkspaces();
  const active = activeWorkspaceId
    ? workspaces.find((workspace) => workspace.id === activeWorkspaceId)
    : undefined;

  const home: Leaf = activeWorkspaceId
    ? {
        label: "Overview",
        href: `/workspaces/${activeWorkspaceId}`,
        icon: DashboardSquare02Icon,
      }
    : { label: "Projects", href: "/dashboard", icon: DashboardSquare02Icon };

  const primary = [home, ...REST];

  /* The workspace's own image when it has one, otherwise the Projects glyph
     the row already used. */
  const homeIcon = active?.avatarUrl ? (
    <Avatar
      member={{
        id: active.id,
        name: active.name ?? activeWorkspaceName ?? "Workspace",
        avatarUrl: active.avatarUrl,
        color: avatarColor(active.id),
      }}
      size={18}
      ring={false}
    />
  ) : (
    <HugeiconsIcon icon={DashboardSquare02Icon} size={16} strokeWidth={1.5} />
  );

  const section = DRILLDOWNS.find((entry) => entry.key === openSection);

  /* Collapsed, a drilldown has no room to expand into, so the row becomes a
     plain link to its first page. */
  if (collapsed) {
    return (
      <nav aria-label="Main navigation" className="px-3 py-3">
        <div className="flex flex-col gap-0.5">
          {[
            { ...home, iconNode: homeIcon },
            ...REST.map((entry) => ({
              ...entry,
              iconNode: (
                <HugeiconsIcon icon={entry.icon} size={16} strokeWidth={1.5} />
              ),
            })),
            ...DRILLDOWNS.map((entry) => ({
              label: entry.label,
              href: entry.children[0]!.href,
              iconNode: (
                <HugeiconsIcon icon={entry.icon} size={16} strokeWidth={1.5} />
              ),
            })),
          ].map((entry) => (
            <SidebarItem
              key={entry.label}
              label={entry.label}
              href={entry.href}
              icon={entry.iconNode}
              collapsed
            />
          ))}
        </div>
      </nav>
    );
  }

  if (section) {
    /* Group the children by their optional heading, keeping order. */
    const groups: Array<{ title?: string; items: DrillChild[] }> = [];

    for (const child of section.children) {
      const last = groups[groups.length - 1];

      if (last && last.title === child.section) {
        last.items.push(child);
      } else {
        groups.push({ title: child.section, items: [child] });
      }
    }

    return (
      <nav
        aria-label={`${section.label} navigation`}
        className="border-b border-orange-50/10 px-3 py-3"
      >
        <div className="mb-1 flex h-9 items-center gap-1">
          <button
            type="button"
            onClick={() => setOpenSection(null)}
            aria-label="Back"
            className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors duration-200 hover:bg-white/6 hover:text-neutral-200"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={14} strokeWidth={1.8} />
          </button>

          <p className="min-w-0 flex-1 truncate text-center text-[13px] font-medium tracking-tight text-neutral-100">
            {section.label}
          </p>

          {/* Balances the back button so the title stays centred. */}
          <span aria-hidden="true" className="size-7 shrink-0" />
        </div>

        {groups.map((group, index) => (
          <div key={group.title ?? `group-${index}`} className="mt-1">
            {group.title && (
              <p className="px-3 pb-1 pt-2 text-[9.5px] font-medium uppercase tracking-[0.14em] text-neutral-600">
                {group.title}
              </p>
            )}

            <div className="flex flex-col gap-0.5">
              {group.items.map((child) => (
                <NavLink
                  key={child.href}
                  to={child.href}
                  end
                  className={({ isActive }) =>
                    [
                      "flex h-9 cursor-pointer items-center gap-3 rounded-lg px-3",
                      "text-[12.5px] tracking-tight transition-colors duration-200",
                      isActive
                        ? "bg-white/6 text-neutral-100"
                        : "text-neutral-400 hover:bg-white/4 hover:text-neutral-100",
                    ].join(" ")
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={[
                          "flex size-5 shrink-0 items-center justify-center",
                          isActive ? "text-orange-100" : "text-neutral-500",
                        ].join(" ")}
                      >
                        <HugeiconsIcon
                          icon={child.icon}
                          size={16}
                          strokeWidth={1.5}
                        />
                      </span>

                      <span className="min-w-0 flex-1 truncate">
                        {child.label}
                      </span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    );
  }

  return (
    <nav
      aria-label="Main navigation"
      className="border-b border-orange-50/10 px-3 py-3"
    >
      <div className="flex flex-col gap-0.5">
        {primary.map((entry) => (
          <SidebarItem
            key={entry.href}
            label={entry.label}
            href={entry.href}
            end={
              entry.href === "/dashboard" ||
              entry.href.startsWith("/workspaces/")
            }
            icon={
              entry === home ? (
                homeIcon
              ) : (
                <HugeiconsIcon icon={entry.icon} size={16} strokeWidth={1.5} />
              )
            }
            collapsed={false}
          />
        ))}
      </div>

      <div aria-hidden="true" className="my-2 h-px bg-orange-50/10" />

      <div className="flex flex-col gap-0.5">
        {DRILLDOWNS.map((entry) => {
          const isActive = entry.children.some((child) =>
            pathname.startsWith(child.href.split("?")[0]!),
          );

          return (
            <button
              key={entry.key}
              type="button"
              onClick={() => setOpenSection(entry.key)}
              className={[
                "group/row flex h-9 w-full cursor-pointer items-center gap-3 rounded-lg px-3",
                "text-[12.5px] tracking-tight transition-colors duration-200",
                isActive
                  ? "bg-white/6 text-neutral-100"
                  : "text-neutral-400 hover:bg-white/4 hover:text-neutral-100",
              ].join(" ")}
            >
              <span
                className={[
                  "flex size-5 shrink-0 items-center justify-center",
                  isActive
                    ? "text-orange-100"
                    : "text-neutral-500 group-hover/row:text-neutral-200",
                ].join(" ")}
              >
                <HugeiconsIcon icon={entry.icon} size={16} strokeWidth={1.5} />
              </span>

              <span className="min-w-0 flex-1 truncate text-left">
                {entry.label}
              </span>

              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={12}
                strokeWidth={1.8}
                className="shrink-0 text-neutral-600 transition-transform duration-200 group-hover/row:translate-x-0.5"
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default SidebarNavigation;
