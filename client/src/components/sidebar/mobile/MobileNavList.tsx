import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  DashboardSquare02Icon,
} from "@hugeicons/core-free-icons";

import { Avatar } from "@/components/board/BoardAvatar";

import { avatarColor } from "@/features/boards";
import { useActiveWorkspace } from "@/stores/activeWorkspace";
import { useWorkspaces } from "@/hooks/useWorkspaces";

import {
  buildNavigation,
  type NavNode,
  type NavSection,
} from "@/components/sidebar/navConfig";

interface MobileNavListProps {
  /** Called after a row is tapped, so the panel can close behind it. */
  onNavigate?: () => void;
}

/* The row, borrowed whole from SidebarNavigation — same height, gap, radius,
   type and the same two states, so the phone tree reads as the same component
   at a smaller width. */
const ROW = [
  "group/row flex h-9 w-full cursor-pointer items-center gap-3 rounded-lg px-3",
  "text-[13px] tracking-tight transition-colors duration-200",
  "motion-reduce:transition-none",
].join(" ");

const ROW_IDLE =
  "text-(--text-secondary) hover:bg-(--tint-4) hover:text-(--text-primary)";
const ROW_ACTIVE = "bg-(--tint-6) text-(--text-primary)";

function hrefsUnder(node: NavNode): string[] {
  return node.children ? node.children.flatMap(hrefsUnder) : [node.href];
}

const pathOf = (href: string) => href.split("?")[0] ?? href;

/** The icon slot: accent while the row is the current page, muted otherwise. */
function IconSlot({
  node,
  homeKey,
  homeIcon,
  active,
}: {
  node: NavNode;
  homeKey: string;
  homeIcon: React.ReactNode;
  active: boolean;
}) {
  return (
    <span
      className={[
        "flex size-5 shrink-0 items-center justify-center",
        active
          ? "text-(--accent)"
          : "text-(--text-muted) group-hover/row:text-(--text-primary)",
      ].join(" ")}
    >
      {node.key === homeKey ? (
        homeIcon
      ) : (
        <HugeiconsIcon icon={node.icon} size={18} strokeWidth={1.5} />
      )}
    </span>
  );
}

function Badge({ value }: { value: string | number }) {
  return (
    <span className="shrink-0 rounded-full bg-(--accent)/10 px-1.5 py-0.5 font-mono text-[9px] font-medium tabular-nums text-(--accent)">
      {value}
    </span>
  );
}

function LeafRow({
  node,
  homeKey,
  homeIcon,
  onNavigate,
}: {
  node: NavNode;
  homeKey: string;
  homeIcon: React.ReactNode;
  onNavigate?: () => void;
}) {
  const { pathname, search } = useLocation();
  const active = pathname + search === node.href;

  return (
    <>
      {/* {node.section ? <SectionLabel title={node.section} /> : null} */}

      <Link
        to={node.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={[ROW, active ? ROW_ACTIVE : ROW_IDLE].join(" ")}
      >
        <IconSlot
          node={node}
          homeKey={homeKey}
          homeIcon={homeIcon}
          active={active}
        />

        <span className="min-w-0 flex-1 truncate text-left">{node.label}</span>

        {node.badge !== undefined && node.badge !== "" ? (
          <Badge value={node.badge} />
        ) : null}
      </Link>
    </>
  );
}

function BranchRow({
  node,
  homeKey,
  homeIcon,
  onNavigate,
}: {
  node: NavNode;
  homeKey: string;
  homeIcon: React.ReactNode;
  onNavigate?: () => void;
}) {
  const { pathname, search } = useLocation();

  /* A branch is lit when the route sits at it or below it — the same rule the
     desktop rail uses, so /boards/:id keeps Boards lit. */
  const under = (href: string) => {
    const path = pathOf(href);
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const containsActive = hrefsUnder(node).some(
    (href) => href === pathname + search || under(href),
  );

  /* Open on a deep link, so the tree shows where it landed without a tap. */
  const [open, setOpen] = useState(containsActive);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={[ROW, containsActive ? ROW_ACTIVE : ROW_IDLE].join(" ")}
      >
        <IconSlot
          node={node}
          homeKey={homeKey}
          homeIcon={homeIcon}
          active={containsActive}
        />

        <span className="min-w-0 flex-1 truncate text-left">{node.label}</span>

        {node.badge !== undefined && node.badge !== "" ? (
          <Badge value={node.badge} />
        ) : null}

        {/* The sidebar's chevron, turned a quarter instead of drilling. */}
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={12}
          strokeWidth={1.8}
          aria-hidden="true"
          className={[
            "shrink-0 text-(--text-subtle) transition-transform duration-200 motion-reduce:transition-none",
            open && "rotate-90",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </button>

      {open && node.children ? (
        <div className="ml-3 flex flex-col gap-0.5 border-l border-(--hairline) pl-1">
          {node.children.map((child) => (
            <Row
              key={child.key}
              node={child}
              homeKey={homeKey}
              homeIcon={homeIcon}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}

function Row(props: {
  node: NavNode;
  homeKey: string;
  homeIcon: React.ReactNode;
  onNavigate?: () => void;
}) {
  return props.node.children ? (
    <BranchRow {...props} />
  ) : (
    <LeafRow {...props} />
  );
}

/**
 * The app's nav tree on a phone, drawn with `SidebarNavigation`'s own row: same
 * icon per row, same workspace avatar on the overview row, same active fill
 * (`--tint-6`), same accent icon, same badge. The only change is what happens
 * on a branch — it expands here instead of drilling into a panel, because a
 * sheet has no room for a second panel.
 */
export default function MobileNavList({ onNavigate }: MobileNavListProps) {
  const { activeWorkspaceId, activeWorkspaceName } = useActiveWorkspace();
  const { workspaces } = useWorkspaces();

  const active = activeWorkspaceId
    ? workspaces.find((workspace) => workspace.id === activeWorkspaceId)
    : undefined;

  const sections: NavSection[] = buildNavigation({
    workspaceId: activeWorkspaceId,
    memberCount: active?.members.length,
  });

  const home = sections[0];
  if (!home) return null;

  const primary = sections.filter((section) => section.placement === "primary");
  const secondary = sections.filter(
    (section) => section.placement === "secondary",
  );

  /* Same rule as the rail: the workspace's own image when it has one, the
     dashboard glyph otherwise. */
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

  return (
    <nav aria-label="Navigation" className="flex flex-col gap-0.5 px-1">
      {primary.map((node) => (
        <Row
          key={node.key}
          node={node}
          homeKey={home.key}
          homeIcon={homeIcon}
          onNavigate={onNavigate}
        />
      ))}

      {secondary.length > 0 ? (
        <>
          <div aria-hidden="true" className="my-2 h-px bg-(--hairline)" />

          <div className="flex flex-col gap-0.5">
            {secondary.map((node) => (
              <Row
                key={node.key}
                node={node}
                homeKey={home.key}
                homeIcon={homeIcon}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </>
      ) : null}
    </nav>
  );
}
