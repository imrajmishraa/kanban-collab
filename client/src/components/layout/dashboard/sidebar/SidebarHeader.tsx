import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeftDoubleIcon,
  ArrowRightDoubleIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { useNavigate } from "react-router-dom";

interface SidebarHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  onSearch: () => void;
}

const SidebarHeader = ({
  collapsed,
  onToggle,
  onSearch,
}: SidebarHeaderProps) => {
  const navigate = useNavigate();

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
        aria-label="Expand sidebar"
        title="Expand sidebar"
        className="group flex h-14 w-full cursor-e-resize items-center justify-center border-b border-neutral-800"
      >
        {/* Brand */}
        <span className="font-mono font-extrabold text-rose-500 transition-opacity duration-150 group-hover:opacity-0">
          &gt;
        </span>

        {/* Expand icon */}
        <HugeiconsIcon
          icon={ArrowRightDoubleIcon}
          size={18}
          strokeWidth={1.8}
          className="absolute text-neutral-400 opacity-0 transition-all duration-150 group-hover:opacity-100 group-hover:text-neutral-100"
        />
      </button>
    );
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-800 px-3">
      {/* Brand */}
      <button
        type="button"
        onClick={() => navigate("/")}
        aria-label="Go to homepage"
        className="group ml-3 flex cursor-pointer items-center gap-2 font-mono text-lg font-bold tracking-tight text-neutral-100 transition-colors hover:text-white"
      >
        <span className="font-extrabold text-rose-500">&gt;</span>

        <span>Kanban</span>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <button
          type="button"
          onClick={onSearch}
          aria-label="Search"
          title="Search"
          className="flex size-8 items-center justify-center text-neutral-500 transition-colors hover:bg-white/4 hover:text-neutral-200"
        >
          <HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={1.5} />
        </button>

        {/* Collapse */}
        <button
          type="button"
          onClick={onToggle}
          aria-label="Collapse sidebar"
          title="Collapse sidebar"
          className="flex size-8 cursor-w-resize items-center justify-center text-neutral-500 transition-colors hover:bg-white/4 hover:text-neutral-200"
        >
          <HugeiconsIcon
            icon={ArrowLeftDoubleIcon}
            size={16}
            strokeWidth={1.5}
          />
        </button>
      </div>
    </header>
  );
};

export default SidebarHeader;
