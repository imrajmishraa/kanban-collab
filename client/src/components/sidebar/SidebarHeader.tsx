import { HugeiconsIcon } from "@hugeicons/react";
import { LayoutAlignLeftIcon } from "@hugeicons/core-free-icons";

import KanbanIcon from "@/assets/KanbanIcon";

import { Tooltip } from "@/components/Tooltips/ToolTip";

import {
  NavbarSearchIcon,
  useSidebarState,
  type SidebarMode,
} from "@/features/dashboard";

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

const SidebarHeader = ({ collapsed }: SidebarHeaderProps) => {
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
            group relative flex size-9 cursor-pointer
            items-center ml-1 justify-center
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
              icon={LayoutAlignLeftIcon}
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
    /*
     * The same frame as the column's header: a quiet title on the left, the
     * surface's controls on the right. The softer control comes first (collapse to
     * the icon strip, this rail's analogue of "full width"), the decisive one last
     * (hide, on the filled background the panel's close button uses).
     *
     * The wordmark is not here any more: the navbar owns it, and the rail's job in
     * its own header is the two things you can do to it.
     */
    <header className="flex h-12 shrink-0 items-center justify-between gap-2.5 px-2">
      <div className="flex shrink-0 items-center gap-1">
        <Tooltip
          label="Hide sidebar"
          highlight={isMac ? "⌘B" : "Ctrl B"}
          side="bottom"
          shape="solid"
          size="md"
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
            items-center ml-1 justify-center
            hover:rounded-lg
            transition-colors
            hover:bg-(--bg-hover)
          "
          >
            {/* Hover hint, hidden normally, visible on hover: a pointer when
                the rail opens by hovering, an arrow when it opens on click. */}
            <HugeiconsIcon
              icon={LayoutAlignLeftIcon}
              size={20}
              strokeWidth={1.8}
              className="
              absolute
              hover:text-(--text-hover)
              transition-all duration-150
              group-hover:scale-100
              text-(--text-primary)
            "
            />
          </button>
        </Tooltip>

        <Tooltip label="Keep open" side="bottom" shape="solid" size="md">
          <NavbarSearchIcon />
        </Tooltip>
      </div>
    </header>
  );
};

export default SidebarHeader;
