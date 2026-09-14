import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeftDoubleIcon,
  ArrowRightDoubleIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { useNavigate } from "react-router-dom";

import { useSearchStore } from "@/stores/searchStore";

interface SidebarHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  toggleLabel?: string;
}

const SidebarHeader = ({
  collapsed,
  onToggle,
  toggleLabel,
}: SidebarHeaderProps) => {
  const navigate = useNavigate();
  const openSearch = useSearchStore((s) => s.openSearch);

  if (collapsed) {
    return (
      <div className="group/expand relative flex h-14 shrink-0 items-center justify-center border-b border-(--border)">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggle();
          }}
          aria-label="Expand sidebar"
          className="group relative flex size-9 cursor-pointer items-center justify-center rounded-lg border border-(--border) bg-white/2 transition-colors hover:bg-white/6"
        >
          <img
            src="/appIcon.png"
            alt="Kanban Collab"
            width={25}
            height={25}
            draggable={false}
            className="h-5 w-5 rounded object-cover opacity-90 transition-opacity duration-150 group-hover:opacity-0"
          />

          <HugeiconsIcon
            icon={ArrowRightDoubleIcon}
            size={16}
            strokeWidth={1.8}
            className="absolute text-(--text-muted) opacity-0 transition-all duration-150 group-hover:opacity-100 group-hover:text-(--text-primary)"
          />
        </button>

        <div
          role="tooltip"
          className="pointer-events-none absolute left-1/2 ml-5 top-full z-50 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-white/12 px-2.5 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.7)] backdrop-blur-md transition-opacity duration-100 group-hover/expand:block group-hover/expand:opacity-100"
        >
          Expand sidebar
        </div>
      </div>
    );
  }

  const collapseLabel = toggleLabel ?? "Collapse sidebar";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between px-3">
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        aria-label="Go to homepage"
        className="group ml-1 flex cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1 transition-colors"
      >
        <img
          src="/appIcon.png"
          alt=""
          width={25}
          height={25}
          draggable={false}
          className="h-6 w-6 object-cover"
        />
        <span className="font-mono text-[14px] font-bold tracking-tight text-(--text-primary)">
          Kanban
        </span>
      </button>

      <div className="flex items-center gap-0.5">
        <HeaderIconButton
          icon={
            <HugeiconsIcon icon={Search01Icon} size={15} strokeWidth={1.6} />
          }
          label="Search ⌘K"
          onClick={openSearch}
        />

        <HeaderIconButton
          icon={
            <HugeiconsIcon
              icon={ArrowLeftDoubleIcon}
              size={15}
              strokeWidth={1.6}
            />
          }
          label={collapseLabel}
          onClick={onToggle}
        />
      </div>
    </header>
  );
};

function HeaderIconButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
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
        aria-label={label}
        className="flex size-8 cursor-pointer items-center justify-center rounded-full text-(--text-muted) transition-colors hover:bg-white/6 hover:text-(--text-primary)"
      >
        {icon}
      </button>

      <div
        role="tooltip"
        className="pointer-events-none absolute right-0 top-full z-50 mt-2 hidden whitespace-nowrap rounded-md bg-white/12 px-2.5 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.7)] backdrop-blur-md transition-opacity duration-100 group-hover/tt:block group-hover/tt:opacity-100 group-focus-within/tt:block group-focus-within/tt:opacity-100"
      >
        {label}
      </div>
    </div>
  );
}

export default SidebarHeader;
