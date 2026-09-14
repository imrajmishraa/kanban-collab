import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";

import { useSearchStore } from "@/stores/searchStore";

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad|iPod/.test(navigator.platform);

export function NavbarSearchIcon() {
  const openSearch = useSearchStore((s) => s.openSearch);

  return (
    <div className="group/tt relative">
      <button
        type="button"
        onClick={openSearch}
        aria-label="Search"
        className="
          flex h-7 w-7 cursor-pointer items-center justify-center
          rounded-md border border-white/8 bg-white/4
          text-(--text-secondary)
          transition-colors duration-150
          hover:border-white/14 hover:bg-white/8 hover:text-(--text-primary)
        "
      >
        <HugeiconsIcon icon={Search01Icon} size={14} strokeWidth={1.6} />
      </button>

      <div
        role="tooltip"
        className="
          pointer-events-none absolute right-0 top-full z-50 mt-2
          hidden whitespace-nowrap rounded-md
          bg-white/12 px-2.5 py-1.5
          text-[11px] font-medium text-white
          opacity-0 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.7)]
          backdrop-blur-md transition-opacity duration-100
          group-hover/tt:block group-hover/tt:opacity-100
          group-focus-within/tt:block group-focus-within/tt:opacity-100
        "
      >
        {isMac ? "Search  ⌘K" : "Search  Ctrl+K"}
      </div>
    </div>
  );
}
