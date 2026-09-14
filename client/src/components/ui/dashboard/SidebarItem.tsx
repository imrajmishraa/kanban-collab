import { useRef, useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";

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
  const itemRef = useRef<HTMLDivElement>(null);
  const [collapsedTooltip, setCollapsedTooltip] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const handleMouseEnter = () => {
    if (!collapsed) return;
    const anchor = itemRef.current?.querySelector("a");
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    setCollapsedTooltip({
      top: rect.top + 4, // 6px below the item
      left: rect.right + 6, // left-aligned with the item
    });
  };

  const handleMouseLeave = () => setCollapsedTooltip(null);

  return (
    <div
      ref={itemRef}
      className="group/item relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <NavLink
        to={href}
        onClick={(event) => event.stopPropagation()}
        aria-label={collapsed ? label : undefined}
        className={({ isActive }) =>
          [
            "relative flex h-9 cursor-pointer items-center gap-3 rounded-lg",
            "font-mono text-[13px]",
            "transition-colors duration-200",
            collapsed ? "justify-center px-0" : "px-3",
            isActive
              ? "bg-white/5 text-(--text-soft)"
              : "text-(--text-soft) hover:bg-white/3 hover:text-(--text-primary)",
          ].join(" ")
        }
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <span
                aria-hidden="true"
                className="absolute -left-3 top-1/2 h-5 w-px -translate-y-1/2 bg-[linear-gradient(180deg,transparent,var(--brand),transparent)]"
              />
            )}

            <span className="flex size-5 shrink-0 items-center justify-center">
              {icon}
            </span>

            {!collapsed && (
              <span className="min-w-0 flex-1 truncate">{label}</span>
            )}
          </>
        )}
      </NavLink>

      {collapsed && collapsedTooltip && (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-50"
          style={{ top: collapsedTooltip.top, left: collapsedTooltip.left }}
        >
          <div className="rounded-md border border-white/12 bg-(--bg-elevated) px-2.5 py-1.5 font-mono text-[11px] text-white/95 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.7)]">
            {label}
          </div>
        </div>
      )}
    </div>
  );
}
