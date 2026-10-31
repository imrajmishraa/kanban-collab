import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  DashboardSquare02Icon,
} from "@hugeicons/core-free-icons";

import SidebarItem from "@/features/dashboard/components/SidebarItem";
import { Avatar } from "@/components/board/BoardAvatar";

import { avatarColor } from "@/features/boards/board.helpers";
import { useActiveWorkspace } from "@/stores/activeWorkspace";
import { useWorkspaces } from "@/hooks/useWorkspaces";

import SidebarDrillPanel from "./SidebarDrillPanel";
import {
  buildNavigation,
  hasChildren,
  resolveTrail,
  trailForRoute,
  type NavNode,
  type NavSection,
} from "./navConfig";

interface SidebarNavigationProps {
  collapsed: boolean;
}

const OPEN_TRAIL_KEY = "sidebar.openTrail";

/**
 * A panel the user opened by hand, tied to the route it was opened on. When
 * the route moves on, the stored route stops matching and the URL takes over
 * again, so no effect is needed to reset it.
 */
interface ManualTrail {
  route: string;
  keys: string[];
}

/** The last panel the user opened, so a reload on a sectionless route restores it. */
function readSavedTrail(): string[] {
  try {
    const raw = window.localStorage.getItem(OPEN_TRAIL_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is string => typeof entry === "string")
      : [];
  } catch {
    return [];
  }
}

function saveTrail(keys: string[]) {
  try {
    window.localStorage.setItem(OPEN_TRAIL_KEY, JSON.stringify(keys));
  } catch {
    /* storage is best effort; the panel still works for this session */
  }
}

const ROW = [
  "group/row flex h-9 w-full cursor-pointer items-center gap-3 rounded-lg px-3",
  "text-[13px] tracking-tight transition-colors duration-200",
  "motion-reduce:transition-none",
].join(" ");

const ROW_IDLE =
  "text-(--text-secondary) hover:bg-(--tint-4) hover:text-(--text-primary)";
const ROW_ACTIVE = "bg-(--tint-6) text-(--text-primary)";

const SidebarNavigation = ({ collapsed }: SidebarNavigationProps) => {
  const { pathname, search } = useLocation();
  const routeKey = `${pathname}${search}`;

  const { activeWorkspaceId, activeWorkspaceName } = useActiveWorkspace();

  /* Shares the cache with the sidebar's own workspace list, so this does not
     add a request. */
  const { workspaces } = useWorkspaces();
  const active = activeWorkspaceId
    ? workspaces.find((workspace) => workspace.id === activeWorkspaceId)
    : undefined;

  const sections = useMemo(
    () =>
      buildNavigation({
        workspaceId: activeWorkspaceId,
        memberCount: active?.members.length,
      }),
    [activeWorkspaceId, active?.members.length],
  );

  /* The panel the current route implies. Derived, never stored, so a deep link
     and a reload both land in the right place without an effect. */
  const routeTrail = useMemo(
    () => trailForRoute(sections, routeKey),
    [sections, routeKey],
  );

  /* Seeded once from storage, and only when the route implies no panel of its
     own. A lazy initialiser keeps this out of render-after-render land. */
  const [manual, setManual] = useState<ManualTrail | null>(() => {
    if (routeTrail.length > 0) return null;
    const saved = readSavedTrail();
    if (saved.length === 0) return null;

    /* Keep only the part of a saved trail that still exists in the config. */
    const keys = resolveTrail(sections, saved).map((node) => node.key);
    return keys.length > 0 ? { route: routeKey, keys } : null;
  });

  /* Manual wins only while the route it was opened on is still current. */
  const trailKeys =
    manual && manual.route === routeKey ? manual.keys : routeTrail;

  const trail = useMemo(
    () => resolveTrail(sections, trailKeys),
    [sections, trailKeys],
  );

  const commit = (route: string, keys: string[]) => {
    setManual({ route, keys });
    saveTrail(keys);
  };

  /* Drilling navigates too, so the panel is remembered for the destination
     route rather than the one we are leaving. */
  const drill = (node: NavNode) => {
    commit(node.href, [...trailKeys, node.key]);
  };

  const back = () => {
    commit(routeKey, trailKeys.slice(0, -1));
  };

  const home = sections[0]!;
  const primary = sections.filter((entry) => entry.placement === "primary");
  const secondary = sections.filter((entry) => entry.placement === "secondary");

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

  /* A section is active when the route sits at it or below it, so /boards/:id
     keeps the Boards row lit. */
  const isUnder = (href: string) => {
    const path = href.split("?")[0] ?? href;
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const isSectionActive = (section: NavSection) => {
    /* The overview sits at /workspaces/:id, which every scoped page is nested
       under, so it matches exactly rather than by prefix. */
    if (section.key === home.key) {
      return pathname === (section.href.split("?")[0] ?? section.href);
    }

    return (
      isUnder(section.href) ||
      (section.children ?? []).some((child) => isUnder(child.href))
    );
  };

  /* Collapsed, a drilldown has no room to expand into, so the row becomes a
     plain link to its first page. */
  if (collapsed) {
    return (
      <nav aria-label="Main navigation" className="py-1 ml-4">
        <div className="flex flex-col gap-0.5">
          {[
            { ...home, iconNode: homeIcon },
            ...primary
              .filter((entry) => entry.key !== home.key)
              .map((entry) => ({
                ...entry,
                iconNode: (
                  <HugeiconsIcon
                    icon={entry.icon}
                    size={18}
                    strokeWidth={1.5}
                  />
                ),
              })),
            ...secondary.map((entry) => ({
              label: entry.label,
              badge: entry.badge,
              href: entry.children?.[0]?.href ?? entry.href,
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

  const openNode = trail[trail.length - 1];

  if (openNode && hasChildren(openNode)) {
    return (
      <SidebarDrillPanel
        node={openNode}
        parents={trail.slice(0, -1)}
        routeKey={routeKey}
        onBack={back}
        onDrill={drill}
      />
    );
  }

  const renderSection = (section: NavSection) => {
    const isActive = isSectionActive(section);
    const openable = hasChildren(section);

    const iconSlot = (
      <span
        className={[
          "flex size-5 shrink-0 items-center justify-center",
          isActive
            ? "text-(--accent)"
            : "text-(--text-muted) group-hover/row:text-(--text-primary)",
        ].join(" ")}
      >
        {section.key === home.key ? (
          homeIcon
        ) : (
          <HugeiconsIcon icon={section.icon} size={18} strokeWidth={1.5} />
        )}
      </span>
    );

    const labelSlot = (
      <span className="min-w-0 flex-1 truncate text-left">{section.label}</span>
    );

    const badgeSlot =
      section.badge !== undefined && section.badge !== "" ? (
        <span className="shrink-0 rounded-full bg-(--accent)/10 px-1.5 py-0.5 font-mono text-[9px] font-medium tabular-nums text-(--accent)">
          {section.badge}
        </span>
      ) : null;

    return (
      <NavLink
        key={section.key}
        to={section.href}
        /* One click: the page opens, and the child nav opens with it. A leaf
           has nothing to open, so it just navigates. */
        onClick={
          openable ? () => commit(section.href, [section.key]) : undefined
        }
        aria-current={isActive ? "page" : undefined}
        className={[ROW, isActive ? ROW_ACTIVE : ROW_IDLE].join(" ")}
      >
        {iconSlot}
        {labelSlot}
        {badgeSlot}

        {/* No children, no chevron. */}
        {openable && (
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={12}
            strokeWidth={1.8}
            className="shrink-0 text-(--text-subtle) transition-transform duration-200 group-hover/row:translate-x-0.5 motion-reduce:transition-none"
          />
        )}
      </NavLink>
    );
  };

  return (
    <nav
      aria-label="Main navigation"
      className="border-b border-(--hairline) px-3 py-3"
    >
      <div className="flex flex-col gap-0.5">{primary.map(renderSection)}</div>

      <div aria-hidden="true" className="my-2 h-px bg-(--hairline)" />

      <div className="flex flex-col gap-0.5">
        {secondary.map(renderSection)}
      </div>
    </nav>
  );
};

export default SidebarNavigation;
