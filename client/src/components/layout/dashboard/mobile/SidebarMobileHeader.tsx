import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { useNavigate } from "react-router-dom";

import { useSearchStore } from "@/stores/searchStore";

interface SidebarMobileHeaderProps {
  onMenuClick: () => void;
}

const SidebarMobileHeader = ({ onMenuClick }: SidebarMobileHeaderProps) => {
  const navigate = useNavigate();
  const openSearch = useSearchStore((s) => s.openSearch);

  return (
    <header className="fixed inset-x-0 top-0 z-30 md:hidden">
      <div className="px-3 pt-3">
        <div
          className="
            group/glass relative overflow-hidden rounded-2xl
            border border-white/8 bg-white/3
            backdrop-blur-xl backdrop-saturate-150
            shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)]
            transition-all duration-300
          "
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35)_50%,transparent)]" />
          <div className="pointer-events-none absolute -top-24 left-1/4 h-40 w-72 -translate-x-1/2 rounded-full bg-(--brand)/14 blur-[60px]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_30%,rgba(255,255,255,0.05)_45%,transparent_60%)]" />

          <div className="relative flex h-14 items-center justify-between px-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              aria-label="Go to homepage"
              className="group flex cursor-pointer items-center gap-2.5 transition-opacity hover:opacity-90"
            >
              <img
                src="/appIcon.png"
                alt=""
                width={28}
                height={28}
                draggable={false}
                className="h-7 w-7 rounded-lg border border-white/8 object-cover shadow-[0_2px_8px_rgba(0,0,0,0.35)] transition-all duration-300 group-hover:border-(--brand)/40"
              />
              <span className="font-mono text-lg font-bold tracking-tight text-(--text-primary)">
                Kanban
              </span>
            </button>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={openSearch}
                aria-label="Search"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-(--text-secondary) transition-colors hover:bg-white/6 hover:text-(--text-primary)"
              >
                <HugeiconsIcon
                  icon={Search01Icon}
                  size={16}
                  strokeWidth={1.5}
                />
              </button>

              <button
                type="button"
                onClick={onMenuClick}
                aria-label="Open navigation menu"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/8 bg-white/4 text-(--text-secondary) transition-colors hover:border-white/14 hover:bg-white/8 hover:text-(--text-primary)"
              >
                <HugeiconsIcon icon={Menu01Icon} size={18} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SidebarMobileHeader;
