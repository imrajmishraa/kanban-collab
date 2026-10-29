import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";

import { useSearchStore } from "@/stores/searchStore";

/**
 * Trigger for the command palette, scoped to boards.
 *
 * Not an input: pressing it opens the main search palette on the Boards
 * section, which searches every board through the API rather than filtering
 * the page of boards already loaded.
 */
export function BoardSearch() {
  const openSearch = useSearchStore((state) => state.openSearch);

  return (
    <button
      type="button"
      onClick={() => openSearch("boards")}
      className="group/search flex h-8 w-full cursor-pointer items-center gap-2 rounded-md border border-orange-50/15 bg-white/3 px-2.5 text-left transition-colors duration-200 hover:border-orange-50/30 hover:bg-white/5 sm:w-56"
    >
      <HugeiconsIcon
        icon={Search01Icon}
        size={13}
        strokeWidth={1.6}
        className="shrink-0 text-neutral-600 transition-colors duration-200 group-hover/search:text-neutral-400"
      />

      <span className="min-w-0 flex-1 truncate text-[12px] tracking-tight text-neutral-500">
        Find board
      </span>

      <kbd className="shrink-0 rounded border border-orange-50/15 bg-white/6 px-1 py-0.5 font-mono text-[9px] text-neutral-500">
        ⌘K
      </kbd>
    </button>
  );
}
