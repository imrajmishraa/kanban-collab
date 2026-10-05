import { Tooltip } from "#components/Tooltips/ToolTip";
import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";

interface SidebarItemProps {
  label: string;
  href: string;
  icon: ReactNode;
  collapsed: boolean;
  pinned?: boolean;
}

export default function SidebarItem({
  label,
  href,
  icon,
  collapsed,
}: SidebarItemProps) {
  const content = (
    <NavLink
      to={href}
      onClick={(event) => event.stopPropagation()}
      aria-label={collapsed ? label : undefined}
      className={({ isActive }) =>
        [
          // Base
          "group/item relative flex h-9 cursor-pointer items-center rounded-lg",
          "font-mono text-[13px]",
          "transition-colors duration-200",

          // Layout
          collapsed
            ? "w-9 justify-center px-0"
            : "w-full justify-start gap-3 px-3",

          // Active / inactive
          isActive
            ? "bg-white/4 text-(--text-primary)"
            : "text-(--text-soft) hover:bg-white/3 hover:text-(--text-primary)",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          {/* Icon */}
          <span
            className={[
              "flex size-5 shrink-0 items-center justify-center",
              "transition-colors duration-200",
              isActive
                ? "text-(--brand)"
                : "text-(--text-soft) group-hover/item:text-(--text-primary)",
            ].join(" ")}
          >
            {icon}
          </span>

          {/* Label */}
          {!collapsed && (
            <span
              className={[
                "min-w-0 flex-1 truncate",
                "transition-colors duration-200",
                isActive ? "text-(--text-primary)" : "text-(--text-soft)",
              ].join(" ")}
            >
              {label}
            </span>
          )}
        </>
      )}
    </NavLink>
  );

  // Expanded → no tooltip at all
  if (!collapsed) {
    return <div className="relative">{content}</div>;
  }

  // Collapsed → tooltip enabled
  return (
    <div className="relative">
      <Tooltip label={label} side="right" shape="solid" size="md" gap={10}>
        {content}
      </Tooltip>
    </div>
  );
}
