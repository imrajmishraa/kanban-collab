import { HugeiconsIcon } from "@hugeicons/react";
import {
  LayoutAlignLeftIcon,
  SidebarLeftIcon,
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
    <header className="flex h-12 shrink-0 items-center px-2">
      {/*
        The logo is the toggle.

        Same 32px box, same 12px offset as the navbar's rail button (`px-3` + no
        margin there, `px-2` + `ml-1` here), so the glyph does not jump between
        the two surfaces. The wordmark keeps its own click target beside it.
      */}
      <Tooltip
        label={"Collapse"}
        highlight={isMac ? "⌘B" : "Ctrl B"}
        side="bottom"
        shape="solid"
        size="md"
      >
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            /* Hovered open, the rail is open because of the pointer: collapsing it
               would fight the gesture, so the click pins what is on screen. */
            if (hovering) setMode("open");
            else onToggle();
          }}
          aria-label={hovering ? "Keep sidebar open" : "Collapse sidebar"}
          className="group ml-2.5 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-(--bg-hover)"
        >
          {/* Logo, visible normally, hidden on hover */}
          <KanbanIcon
            size={22}
            variant="upper"
            className="transition-all duration-150 group-hover:opacity-0 group-focus-within:opacity-0"
          />

          {/* The hint takes the logo's place: the same two glyphs the collapsed
              rail uses, so the two ends of the rail speak the same language. */}
          <HugeiconsIcon
            icon={SidebarLeftIcon}
            size={18}
            strokeWidth={1.8}
            className="absolute text-(--text-muted) opacity-0 scale-75 transition-all duration-150 group-hover:scale-100 group-hover:opacity-100 group-hover:text-(--text-primary) group-focus-within:scale-100 group-focus-within:opacity-100"
          />
        </button>
      </Tooltip>

      <button
        type="button"
        onClick={() => navigate("/workspaces")}
        aria-label="Go to workspaces"
        className="ml-1.5 flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1 transition-colors"
      >
        <span className="text-[15px] font-semibold tracking-tight text-(--text-primary)">
          Kanban
        </span>
      </button>
    </header>
  );
};

export default SidebarHeader;
