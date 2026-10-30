import { Tooltip } from "@components/Tooltips/ToolTip";
import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";

interface SidebarItemProps {
  label: string;
  href: string;
  icon: ReactNode;
  collapsed: boolean;
  badge?: string | number;
  end?: boolean;
  nested?: boolean;
}

export default function SidebarItem({
  label,
  href,
  icon,
  collapsed,
  badge,
  end,
  nested,
}: SidebarItemProps) {
  const content = (
    <NavLink
      to={href}
      end={end}
      onClick={(event) => event.stopPropagation()}
      aria-label={collapsed ? label : undefined}
      className={({ isActive }) =>
        [
          "group/item relative flex h-10 cursor-pointer items-center rounded-lg",
          "text-[12.5px] tracking-tight",
          "transition-colors duration-200",

          collapsed
            ? "w-10 justify-center px-0"
            : nested
              ? "w-full justify-start gap-2 pr-3 pl-9"
              : "w-full justify-start gap-3 px-3",

          isActive
            ? "bg-(--tint-6) text-(--text-primary)"
            : "text-(--text-secondary) hover:bg-(--tint-4) hover:text-(--text-primary)",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          {!nested && (
            <span
              className={[
                "flex size-6 shrink-0 items-center justify-center",
                "transition-colors duration-200",
                isActive
                  ? "text-(--accent)"
                  : "text-(--text-muted) group-hover/item:text-(--text-primary)",
              ].join(" ")}
            >
              {icon}
            </span>
          )}

          {!collapsed && (
            <span
              className={[
                "min-w-0 flex-1 truncate",
                "transition-colors duration-200",
                isActive ? "text-(--text-primary)" : "text-(--text-secondary)",
              ].join(" ")}
            >
              {label}
            </span>
          )}

          {!collapsed && badge !== undefined && badge !== "" && (
            <span className="shrink-0 rounded-full bg-(--accent-soft) px-1.5 py-0.5 font-mono text-[9px] font-medium tabular-nums text-(--accent)">
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );

  if (!collapsed) {
    return <div className="relative">{content}</div>;
  }

  return (
    <div className="relative">
      <Tooltip label={label} side="right" shape="solid" size="md" gap={10}>
        {content}
      </Tooltip>
    </div>
  );
}
