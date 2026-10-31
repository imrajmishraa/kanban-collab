import { HugeiconsIcon } from "@hugeicons/react";
import {
  MousePointerBanIcon,
  SidebarLeftIcon,
} from "@hugeicons/core-free-icons";
import { useNavigate } from "react-router-dom";

import logo from "@/assets/logo.svg?inline";
import { Tooltip } from "@/components/Tooltips/ToolTip";

import { useSidebarState, type SidebarMode } from "@/features/dashboard";

interface SidebarHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  toggleLabel?: string;
  /** True while the rail is open only because the pointer is over it. */
  hovering?: boolean;
  /** Decides which hover hint the collapsed logo shows. */
  mode?: SidebarMode;
}

const SidebarHeader = ({
  collapsed,
  onToggle,
  hovering = false,
  mode = "open",
}: SidebarHeaderProps) => {
  const navigate = useNavigate();
  const setMode = useSidebarState((state) => state.setMode);

  if (collapsed) {
    return (
      <div className="group/expand relative flex h-14 shrink-0 items-center justify-center">
        <Tooltip label="Expand" side="right" shape="solid" size="md" gap={10}>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggle();
            }}
            aria-label="Expand sidebar"
            className="
            group relative flex size-10 cursor-pointer
            items-center justify-center
            rounded-full
            bg-(--tint-2)
            transition-colors
            hover:bg-(--bg-hover)
          "
          >
            {/* Logo, visible normally, hidden on hover */}
            <img
              src={logo}
              alt=""
              width={16}
              height={16}
              draggable={false}
              className="
              h-7 w-7 rounded-full
              transition-all duration-150
              group-hover:scale-75
              group-hover:opacity-0
            "
            />

            {/* Hover hint, hidden normally, visible on hover: a pointer when
                the rail opens by hovering, an arrow when it opens on click. */}
            <HugeiconsIcon
              icon={mode === "hover" ? MousePointerBanIcon : SidebarLeftIcon}
              size={16}
              strokeWidth={1.8}
              className="
              absolute
              text-(--text-muted)
              opacity-0
              scale-75
              transition-all duration-150
              group-hover:scale-100
              group-hover:opacity-100
              group-hover:text-(--text-primary)
            "
            />
          </button>
        </Tooltip>
      </div>
    );
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between px-3">
      <button
        type="button"
        onClick={() => navigate("/workspaces")}
        aria-label="Go to homepage"
        className="group ml-1 flex cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1 transition-colors"
      >
        <img
          src={logo}
          alt=""
          width={16}
          height={16}
          draggable={false}
          className="h-6 w-6 rounded-full transition-all duration-300"
        />
        <span className="text-[14px] font-semibold tracking-tight text-(--text-primary)">
          Kanban
        </span>
      </button>

      {/* Hovered open, the rail is open because of the pointer, so collapsing
          it has nothing to act on. The cursor takes its place and pins the rail
          open, which is the useful action in that state. */}
      <div className="flex items-center gap-0.5">
        {hovering ? (
          <Tooltip label="Keep open" side="bottom" shape="solid" size="md">
            <HeaderIconButton
              icon={
                <HugeiconsIcon
                  icon={MousePointerBanIcon}
                  size={15}
                  strokeWidth={1.6}
                />
              }
              onClick={() => setMode("open")}
            />
          </Tooltip>
        ) : (
          <Tooltip label="Collapse" side="bottom" shape="solid" size="md">
            <HeaderIconButton
              icon={
                <HugeiconsIcon
                  icon={SidebarLeftIcon}
                  size={15}
                  strokeWidth={1.6}
                />
              }
              onClick={onToggle}
            />
          </Tooltip>
        )}
      </div>
    </header>
  );
};

function HeaderIconButton({
  icon,
  onClick,
}: {
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <div className="group/tt relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className="flex size-8 cursor-pointer items-center justify-center rounded-full text-(--text-muted) transition-colors hover:bg-(--bg-hover) hover:text-(--text-primary)"
      >
        {icon}
      </button>
    </div>
  );
}

export default SidebarHeader;
