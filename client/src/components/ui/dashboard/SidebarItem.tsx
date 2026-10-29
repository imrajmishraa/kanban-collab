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
          "group/item relative flex h-9 cursor-pointer items-center rounded-lg",
          "text-[12.5px] tracking-tight",
          "transition-colors duration-200",

          collapsed
            ? "w-9 justify-center px-0"
            : nested
              ? "w-full justify-start gap-2 pr-3 pl-9"
              : "w-full justify-start gap-3 px-3",

          isActive
            ? "bg-white/6 text-neutral-100"
            : "text-neutral-400 hover:bg-white/4 hover:text-neutral-100",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          {!nested && (
            <span
              className={[
                "flex size-5 shrink-0 items-center justify-center",
                "transition-colors duration-200",
                isActive
                  ? "text-orange-100"
                  : "text-neutral-500 group-hover/item:text-neutral-200",
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
                isActive ? "text-neutral-100" : "text-neutral-400",
              ].join(" ")}
            >
              {label}
            </span>
          )}

          {!collapsed && badge !== undefined && badge !== "" && (
            <span className="shrink-0 rounded-full bg-orange-100/10 px-1.5 py-0.5 font-mono text-[9px] font-medium tabular-nums text-orange-100">
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
