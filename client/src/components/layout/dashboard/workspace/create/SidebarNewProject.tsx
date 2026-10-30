import { useEffect } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";

import { Tooltip } from "@components/Tooltips/ToolTip";

import { useNewWorkspaceDialog } from "./newWorkspaceDialog.context";

interface SidebarNewProjectProps {
  collapsed: boolean;
}

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad|iPod/.test(navigator.platform);

const SHORTCUT = isMac ? "⌘ ⇧ K" : "Ctrl ⇧ K";

/**
 * Creates a workspace, which the sidebar calls a project.
 *
 * Same dialog as before, narrower and with the shorter label so it sits under
 * Find without competing with the nav. The shortcut is kept, since it is the
 * only keyboard route to creating one.
 */
export default function SidebarNewProject({
  collapsed,
}: SidebarNewProjectProps) {
  const { open } = useNewWorkspaceDialog();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const modKey = isMac ? event.metaKey : event.ctrlKey;

      if (modKey && event.shiftKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        open();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (collapsed) {
    return (
      <div className="flex shrink-0 justify-center px-2 pb-2">
        <Tooltip
          label="New project"
          highlight={SHORTCUT}
          side="right"
          shape="solid"
          size="md"
          gap={10}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              open();
            }}
            aria-label={`New project (${SHORTCUT})`}
            className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-(--hairline) text-(--text-soft) transition-colors duration-200 hover:border-(--hairline-strong) hover:bg-(--bg-hover) hover:text-(--text-primary)"
          >
            <HugeiconsIcon icon={Add01Icon} size={14} strokeWidth={2} />
          </button>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="shrink-0 px-3 pb-2">
      <button
        type="button"
        onClick={open}
        className="group/project flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg border border-(--hairline) bg-(--tint-3) px-2.5 text-left transition-colors duration-200 hover:border-(--hairline-strong) hover:bg-(--bg-hover)"
      >
        <HugeiconsIcon
          icon={Add01Icon}
          size={14}
          strokeWidth={2}
          className="shrink-0 text-(--text-muted) transition-colors duration-200 group-hover/project:text-(--accent)"
        />

        <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium tracking-tight text-(--text-primary)">
          Project
        </span>

        <kbd className="shrink-0 rounded border border-(--hairline) bg-(--tint-6) px-1.5 py-0.5 font-mono text-[9px] text-(--text-muted)">
          {isMac ? "⌘⇧K" : "Ctrl⇧K"}
        </kbd>
      </button>
    </div>
  );
}
