import { HugeiconsIcon } from "@hugeicons/react";
import {
  MousePointerBanIcon,
  SidebarLeftIcon,
  LayoutAlignLeftIcon,
} from "@hugeicons/core-free-icons";
import { useNavigate } from "react-router-dom";

import KanbanIcon from "@/assets/KanbanIcon";

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

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad|iPod/.test(navigator.platform);

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
      <div className="group/expand relative flex h-12 shrink-0 items-center justify-center">
        <Tooltip
          label="Hide"
          highlight={isMac ? "⌘ ⇧ B" : "Ctrl ⇧ B"}
          side="right"
          shape="solid"
          size="md"
          gap={10}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setMode("hidden");
            }}
            aria-label="Hide sidebar"
            className="
            group relative flex size-8 cursor-pointer
            items-center justify-center
            hover:rounded-lg
            transition-colors
            hover:bg-(--bg-hover)
          "
          >
            {/* Logo, visible normally, hidden on hover */}
            <KanbanIcon
              size={22}
              variant="upper"
              className="transition-all duration-150 group-hover:opacity-0"
            />

            {/* Hover hint, hidden normally, visible on hover: a pointer when
                the rail opens by hovering, an arrow when it opens on click. */}
            <HugeiconsIcon
              icon={
                mode === "hover" ? MousePointerBanIcon : LayoutAlignLeftIcon
              }
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
    <header className="flex h-12 shrink-0 items-center justify-between px-2">
      <button
        type="button"
        onClick={() => navigate("/workspaces")}
        aria-label="Go to homepage"
        className="group ml-1 flex cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1 transition-colors"
      >
        {/* Logo, visible normally, hidden on hover */}
        <KanbanIcon
          size={22}
          variant="upper"
          className="transition-all duration-150 group-hover:scale-110"
        />

        <span className="text-[15px] font-semibold tracking-tight text-(--text-primary)">
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
                  size={18}
                  strokeWidth={1.6}
                />
              }
              onClick={() => setMode("open")}
            />
          </Tooltip>
        ) : (
          <Tooltip
            label="Collapse"
            highlight={isMac ? "⌘B" : "Ctrl B"}
            side="bottom"
            shape="solid"
            size="md"
          >
            <HeaderIconButton
              icon={
                <HugeiconsIcon
                  icon={SidebarLeftIcon}
                  size={18}
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
        className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-(--text-muted) transition-colors hover:bg-(--bg-hover) hover:text-(--text-primary)"
      >
        {icon}
      </button>
    </div>
  );
}

export default SidebarHeader;
