import {
  DashboardSquare02Icon,
  KanbanIcon,
  LogsIcon,
  Message01Icon,
  Note01Icon,
  Settings01Icon,
  UserGroupIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";

/** The icon component type Hugeicons exposes, narrowed to one icon. */
export type NavIcon = typeof KanbanIcon;

export type NavPlacement = "primary" | "secondary";

interface NavNodeBase {
  /** Stable identity. Used for the open trail, persistence and React keys. */
  key: string;
  label: string;
  /** The route to open. May carry a query string, like /activity?type=cards. */
  href: string;
  icon: NavIcon;
  /** Optional heading above the row: Filter by, Account, Archive. */
  section?: string;
  /** Optional count on the right of the row, like Environment Variables 20. */
  badge?: string | number;
}

/** A row that ends here: nothing to open, so no chevron. */
export interface NavLeaf extends NavNodeBase {
  children?: never;
}

/** A row that opens its own panel. Children may themselves be branches. */
export interface NavBranch extends NavNodeBase {
  children: NavNode[];
}

export type NavNode = NavLeaf | NavBranch;

/** A top-level row, above the hairline or below it. */
export type NavSection = NavNode & { placement: NavPlacement };

export interface NavigationContext {
  workspaceId: string | null;
  /** Live count for the Members row, when the workspace is loaded. */
  memberCount?: number;
}

/**
 * The whole sidebar, as data. The component renders whatever this returns, so
 * adding a section or a child never touches the component again.
 *
 * Hrefs stay inside the routes that exist: /workspaces, /workspaces/:id,
 * /boards, /notes, /members, /activity, /user/profile and /settings. Filter
 * variants ride on the query string, which is what the activity page already
 * does.
 */
export function buildNavigation({
  workspaceId,
  memberCount,
}: NavigationContext): NavSection[] {
  const workspaceHref = workspaceId ? `/workspaces/${workspaceId}` : "/workspaces";

  /* Everything that only makes sense inside a workspace is scoped to it. With
     nothing selected the unscoped path is kept, which is the route that asks
     for a workspace first. */
  const at = (path: string) => (workspaceId ? `/workspaces/${workspaceId}${path}` : path);

  /* Only a few rows carry a child nav. The rest are plain links: no panel to
     open, so no chevron either. */
  const home: NavSection = {
    key: workspaceId ? "overview" : "projects",
    label: workspaceId ? "Overview" : "Projects",
    href: workspaceHref,
    icon: DashboardSquare02Icon,
    placement: "primary",
  };

  return [
    home,
    {
      key: "boards",
      label: "Boards",
      href: at("/boards"),
      icon: KanbanIcon,
      placement: "primary",
      children: [
        {
          key: "boards.all",
          label: "All boards",
          href: at("/boards"),
          icon: KanbanIcon,
          section: "Library",
          children: [
            {
              key: "boards.all.recent",
              label: "Recently viewed",
              href: at("/boards?filter=recent"),
              icon: LogsIcon,
            },
            {
              key: "boards.all.shared",
              label: "Shared with me",
              href: at("/boards?filter=shared"),
              icon: UserGroupIcon,
            },
            {
              key: "boards.all.mine",
              label: "Created by me",
              href: at("/boards?filter=mine"),
              icon: UserIcon,
            },
          ],
        },
        {
          key: "boards.pinned",
          label: "Pinned",
          href: at("/boards?filter=pinned"),
          icon: KanbanIcon,
        },
        {
          key: "boards.archived",
          label: "Archived",
          href: at("/boards?filter=archived"),
          icon: DashboardSquare02Icon,
          section: "Archive",
        },
      ],
    },
    {
      key: "notes",
      label: "Notes",
      href: at("/notes"),
      icon: Note01Icon,
      placement: "primary",
    },
    {
      key: "members",
      label: "Members",
      href: at("/members"),
      icon: UserGroupIcon,
      placement: "primary",
      badge: memberCount && memberCount > 0 ? memberCount : undefined,
    },
    {
      key: "activity",
      label: "Activity",
      href: at("/activity"),
      icon: LogsIcon,
      placement: "primary",
      children: [
        {
          key: "activity.all",
          label: "All activity",
          href: "/activity",
          icon: LogsIcon,
        },
        {
          key: "activity.comments",
          label: "Comments",
          href: at("/activity?type=comments"),
          icon: Message01Icon,
          section: "Filter by",
          children: [
            {
              key: "activity.comments.cards",
              label: "On cards",
              href: at("/activity?type=comments&on=cards"),
              icon: KanbanIcon,
            },
            {
              key: "activity.comments.boards",
              label: "On boards",
              href: at("/activity?type=comments&on=boards"),
              icon: DashboardSquare02Icon,
            },
          ],
        },
        {
          key: "activity.cards",
          label: "Cards",
          href: at("/activity?type=cards"),
          icon: KanbanIcon,
          children: [
            {
              key: "activity.cards.created",
              label: "Created",
              href: at("/activity?type=cards&action=created"),
              icon: KanbanIcon,
            },
            {
              key: "activity.cards.moved",
              label: "Moved",
              href: at("/activity?type=cards&action=moved"),
              icon: KanbanIcon,
            },
            {
              key: "activity.cards.deleted",
              label: "Deleted",
              href: at("/activity?type=cards&action=deleted"),
              icon: KanbanIcon,
            },
          ],
        },
        {
          key: "activity.boards",
          label: "Boards",
          href: at("/activity?type=boards"),
          icon: DashboardSquare02Icon,
        },
      ],
    },
    {
      key: "project-settings",
      label: "Settings",
      href: "/workspaces/~/settings/general",
      icon: Settings01Icon,
      placement: "secondary",
      children: [
        {
          key: "project-settings.general",
          label: "General",
          href: "/workspaces/~/settings/general",
          icon: Settings01Icon,
          section: "Workspace",
        },
        {
          key: "project-settings.notifications",
          label: "Notifications",
          href: "/workspaces/~/settings/notifications",
          icon: Message01Icon,
        },
      ],
    },
  ];
}

/** A node is openable when it has at least one child. */
export function hasChildren(node: NavNode): node is NavBranch {
  return Array.isArray(node.children) && node.children.length > 0;
}

/** The chain of nodes a trail of keys points at, in order. */
export function resolveTrail(
  sections: NavSection[],
  keys: string[],
): NavNode[] {
  const trail: NavNode[] = [];
  let level: NavNode[] = sections;

  for (const key of keys) {
    const next = level.find((node) => node.key === key);
    if (!next) break;
    trail.push(next);
    level = next.children ?? [];
  }

  return trail;
}

/**
 * The trail implied by a route, so the panel opens itself on a deep link and
 * survives a reload. A child opens its own level only when the route sits
 * below it, never when the route is the child itself.
 */
export function trailForRoute(
  sections: NavSection[],
  routeKey: string,
): string[] {
  const matchesRoute = (nodes: NavNode[]): boolean =>
    nodes.some(
      (node) =>
        node.href === routeKey ||
        (node.children ? matchesRoute(node.children) : false),
    );

  const section =
    sections.find((entry) => entry.href === routeKey) ??
    sections.find((entry) =>
      entry.children ? matchesRoute(entry.children) : false,
    );

  /* A leaf section has no panel, so it has no trail either. */
  if (!section || !hasChildren(section)) return [];

  const trail = [section.key];
  let level = section.children ?? [];

  for (;;) {
    const opener = level.find(
      (node) => hasChildren(node) && matchesRoute(node.children ?? []),
    );
    if (!opener) break;
    trail.push(opener.key);
    level = opener.children ?? [];
  }

  return trail;
}
