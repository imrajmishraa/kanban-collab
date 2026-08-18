import { useState, type MouseEvent, type ReactNode } from "react";
import { NavLink } from "react-router-dom";

interface SidebarItemProps {
  label: string;
  href: string;
  icon: ReactNode;
  collapsed: boolean;
}

const SidebarItem = ({ label, href, icon, collapsed }: SidebarItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const [flyoutPosition, setFlyoutPosition] = useState({
    top: 0,
    left: 0,
  });

  const handleMouseEnter = (event: MouseEvent<HTMLDivElement>) => {
    if (!collapsed) {
      return;
    }

    const rect = event.currentTarget
      .querySelector("a")
      ?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    setFlyoutPosition({
      top: rect.top + rect.height / 2,
      left: rect.right + 8,
    });

    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <NavLink
        to={href}
        onClick={(event) => {
          event.stopPropagation();
        }}
        aria-label={collapsed ? label : undefined}
        className={({ isActive }) =>
          [
            "flex h-9 items-center gap-3 px-3",
            "border-l text-sm font-mono",
            "transition-colors duration-150",

            isActive
              ? "border-rose-500 bg-white/4 text-white"
              : "border-transparent text-neutral-500 hover:bg-white/2.5 hover:text-neutral-200",

            collapsed ? "justify-center px-0" : "",
          ].join(" ")
        }
      >
        <span className="flex size-4 shrink-0 items-center justify-center">
          {icon}
        </span>

        {!collapsed && <span className="truncate">{label}</span>}
      </NavLink>

      {/* Collapsed navigation flyout */}
      {collapsed && isHovered && (
        <div
          className="pointer-events-none fixed ml-1 z-100"
          style={{
            top: flyoutPosition.top,
            left: flyoutPosition.left,
            transform: "translateY(-50%)",
          }}
        >
          <div
            className={[
              "border border-neutral-800",
              "bg-[#0b0b0b]",
              "px-3 py-2",
              "font-mono text-xs text-neutral-200",
              "shadow-[0_8px_24px_rgba(0,0,0,0.45)]",
              "animate-in fade-in slide-in-from-left-1",
            ].join(" ")}
          >
            {label}
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarItem;
