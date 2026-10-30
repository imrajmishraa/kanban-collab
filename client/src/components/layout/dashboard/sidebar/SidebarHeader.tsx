import { HugeiconsIcon } from "@hugeicons/react";
import { SidebarLeftIcon } from "@hugeicons/core-free-icons";
import { useNavigate } from "react-router-dom";

import logo from "@/assets/logo.svg?inline";
import { Tooltip } from "@components/Tooltips/ToolTip";

interface SidebarHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  toggleLabel?: string;
  /** True while the rail is open only because the pointer is over it. */
  hovering?: boolean;
}

const SidebarHeader = ({
  collapsed,
  onToggle,
  hovering = false,
}: SidebarHeaderProps) => {
  const navigate = useNavigate();

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
            group relative flex size-9 cursor-pointer
            items-center justify-center
            rounded-full
            bg-white/2
            transition-colors
            hover:bg-white/6
          "
          >
            {/* Logo, visible normally, hidden on hover */}
            <img
              src={logo}
              alt=""
              width={28}
              height={28}
              draggable={false}
              className="
              h-8 w-8 rounded-full
              transition-all duration-150
              group-hover:scale-75
              group-hover:opacity-0
            "
            />

            {/* Arrow, hidden normally, visible on hover */}
            <HugeiconsIcon
              icon={SidebarLeftIcon}
              size={18}
              strokeWidth={1.8}
              className="
              absolute
              text-neutral-500
              opacity-0
              scale-75
              transition-all duration-150
              group-hover:scale-100
              group-hover:opacity-100
              group-hover:text-neutral-100
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
          width={28}
          height={28}
          draggable={false}
          className="h-8 w-8 rounded-full transition-all duration-300"
        />
        <span className="text-[14px] font-semibold tracking-tight text-neutral-100">
          Kanban
        </span>
      </button>

      {/* Hovered open, the rail is open because of the pointer, so a control
          that collapses it has nothing to act on. */}
      {!hovering && (
        <div className="flex items-center gap-0.5">
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
        </div>
      )}
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
        className="flex size-8 cursor-pointer items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-white/6 hover:text-neutral-100"
      >
        {icon}
      </button>
    </div>
  );
}

export default SidebarHeader;
