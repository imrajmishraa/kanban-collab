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
 * Hrefs stay inside the routes that exist: /dashboard, /workspaces/:id,
 * /boards, /notes, /members, /activity, /user/profile and /settings. Filter
 * variants ride on the query string, which is what the activity page already
 * does.
 */
export function buildNavigation({
  workspaceId,
  memberCount,
}: NavigationContext): NavSection[] {
  const workspaceHref = workspaceId
    ? `/workspaces/${workspaceId}`
    : "/dashboard";

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
      href: "/boards",
      icon: KanbanIcon,
      placement: "primary",
      children: [
        {
          key: "boards.all",
          label: "All boards",
          href: "/boards",
          icon: KanbanIcon,
          section: "Library",
          children: [
            {
              key: "boards.all.recent",
              label: "Recently viewed",
              href: "/boards?filter=recent",
              icon: LogsIcon,
            },
            {
              key: "boards.all.shared",
              label: "Shared with me",
              href: "/boards?filter=shared",
              icon: UserGroupIcon,
            },
            {
              key: "boards.all.mine",
              label: "Created by me",
              href: "/boards?filter=mine",
              icon: UserIcon,
            },
          ],
        },
        {
          key: "boards.pinned",
          label: "Pinned",
          href: "/boards?filter=pinned",
          icon: KanbanIcon,
        },
        {
          key: "boards.archived",
          label: "Archived",
          href: "/boards?filter=archived",
          icon: DashboardSquare02Icon,
          section: "Archive",
        },
      ],
    },
    {
      key: "notes",
      label: "Notes",
      href: "/notes",
      icon: Note01Icon,
      placement: "primary",
    },
    {
      key: "members",
      label: "Members",
      href: "/members",
      icon: UserGroupIcon,
      placement: "primary",
      badge: memberCount && memberCount > 0 ? memberCount : undefined,
    },
    {
      key: "activity",
      label: "Activity",
      href: "/activity",
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
          href: "/activity?type=comments",
          icon: Message01Icon,
          section: "Filter by",
          children: [
            {
              key: "activity.comments.cards",
              label: "On cards",
              href: "/activity?type=comments&on=cards",
              icon: KanbanIcon,
            },
            {
              key: "activity.comments.boards",
              label: "On boards",
              href: "/activity?type=comments&on=boards",
              icon: DashboardSquare02Icon,
            },
          ],
        },
        {
          key: "activity.cards",
          label: "Cards",
          href: "/activity?type=cards",
          icon: KanbanIcon,
          children: [
            {
              key: "activity.cards.created",
              label: "Created",
              href: "/activity?type=cards&action=created",
              icon: KanbanIcon,
            },
            {
              key: "activity.cards.moved",
              label: "Moved",
              href: "/activity?type=cards&action=moved",
              icon: KanbanIcon,
            },
            {
              key: "activity.cards.deleted",
              label: "Deleted",
              href: "/activity?type=cards&action=deleted",
              icon: KanbanIcon,
            },
          ],
        },
        {
          key: "activity.boards",
          label: "Boards",
          href: "/activity?type=boards",
          icon: DashboardSquare02Icon,
        },
      ],
    },
    {
      key: "settings",
      label: "Settings",
      href: "/settings",
      icon: Settings01Icon,
      placement: "secondary",
      children: [
        {
          key: "settings.profile",
          label: "Profile",
          href: "/user/profile",
          icon: UserIcon,
          section: "Account",
        },
        {
          key: "settings.preferences",
          label: "Preferences",
          href: "/settings",
          icon: Settings01Icon,
        },
        {
          key: "settings.notifications",
          label: "Notifications",
          href: "/settings?tab=notifications",
          icon: Message01Icon,
          children: [
            {
              key: "settings.notifications.email",
              label: "Email",
              href: "/settings?tab=notifications&channel=email",
              icon: Message01Icon,
            },
            {
              key: "settings.notifications.inapp",
              label: "In app",
              href: "/settings?tab=notifications&channel=inapp",
              icon: Message01Icon,
            },
          ],
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
