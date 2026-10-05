import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeftDoubleIcon,
  ArrowRightDoubleIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { useNavigate } from "react-router-dom";

import { useSearchStore } from "@/stores/searchStore";
import logo from "@/assets/logo.svg?inline";
import { Tooltip } from "#components/Tooltips/ToolTip";
interface SidebarHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  toggleLabel?: string;
}

const SidebarHeader = ({ collapsed, onToggle }: SidebarHeaderProps) => {
  const navigate = useNavigate();
  const openSearch = useSearchStore((s) => s.openSearch);

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
            {/* Logo — visible normally, hidden on hover */}
            <img
              src={logo}
              alt=""
              width={28}
              height={28}
              draggable={false}
              className="
              h-8 w-8 rounded-lg
              shadow-[0_2px_8px_rgba(0,0,0,0.35)]
              transition-all duration-150
              group-hover:scale-75
              group-hover:opacity-0
            "
            />

            {/* Arrow — hidden normally, visible on hover */}
            <HugeiconsIcon
              icon={ArrowRightDoubleIcon}
              size={18}
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
        onClick={() => navigate("/dashboard")}
        aria-label="Go to homepage"
        className="group ml-1 flex cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1 transition-colors"
      >
        <img
          src={logo}
          alt=""
          width={28}
          height={28}
          draggable={false}
          className="h-8 w-8 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.35)] transition-all duration-300"
        />
        <span className="font-mono text-[14px] font-bold tracking-tight text-(--text-primary)">
          Kanban
        </span>
      </button>

      <div className="flex items-center gap-0.5">
        <Tooltip label="Search ⌘K" side="bottom" shape="solid" size="md">
          <HeaderIconButton
            icon={
              <HugeiconsIcon icon={Search01Icon} size={15} strokeWidth={1.6} />
            }
            onClick={openSearch}
          />
        </Tooltip>

        <Tooltip label="Collaspe" side="bottom" shape="solid" size="md">
          <HeaderIconButton
            icon={
              <HugeiconsIcon
                icon={ArrowLeftDoubleIcon}
                size={15}
                strokeWidth={1.6}
              />
            }
            onClick={onToggle}
          />
        </Tooltip>
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
        className="flex size-8 cursor-pointer items-center justify-center rounded-full text-(--text-muted) transition-colors hover:bg-white/6 hover:text-(--text-primary)"
      >
        {icon}
      </button>
    </div>
  );
}

export default SidebarHeader;
