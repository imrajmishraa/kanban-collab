import { useEffect } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import { AddCircleIcon } from "@hugeicons/core-free-icons";

import { Tooltip } from "#components/Tooltips/ToolTip";

import { useNewWorkspaceDialog } from "./newWorkspaceDialog.context";

interface SidebarNewWorkspaceProps {
  collapsed: boolean;
}

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad|iPod/.test(navigator.platform);

/** Rendered inside the bubble's cream highlight slot. */
const SHORTCUT = isMac ? "⌘ ⇧ K" : "Ctrl ⇧ K";

export default function SidebarNewWorkspace({
  collapsed,
}: SidebarNewWorkspaceProps) {
  const { open } = useNewWorkspaceDialog();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const modKey = isMac ? event.metaKey : event.ctrlKey;
      // Require Shift, ⌘K belongs to search, ⌘⇧K opens new workspace
      if (modKey && event.shiftKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        open();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  /* ── Collapsed ──────────────────────────────────────────── */
  if (collapsed) {
    return (
      <div className="shrink-0 px-2 pt-3">
        <Tooltip
          label="New workspace"
          highlight={SHORTCUT}
          side="right"
          shape="solid"
          size="md"
          gap={10}
        >
          <button
            type="button"
            onClick={(event) => {
              // The collapsed rail expands on any click, keep this one.
              event.stopPropagation();
              open();
            }}
            aria-label={`New workspace (${SHORTCUT})`}
            className="
              mx-auto flex size-9 ml-1 cursor-pointer items-center justify-center
              rounded-xl border border-orange-50/15 bg-white/5
              text-(--text-primary)
              transition-colors duration-200
              hover:border-orange-50/25 hover:bg-white/8
              focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/20
            "
          >
            <HugeiconsIcon icon={AddCircleIcon} size={18} strokeWidth={1.6} />
          </button>
        </Tooltip>
      </div>
    );
  }

  /* ── Expanded ───────────────────────────────────────────── */
  // The label and shortcut are both visible here, so a tooltip would only
  // repeat them. It is added on the icon-only (collapsed) state instead.
  return (
    <div className="shrink-0 px-3 pt-3 pb-2">
      <button
        type="button"
        onClick={open}
        className="
          group/new flex h-9 w-full cursor-pointer items-center gap-2.5
          rounded-xl border border-orange-50/15 bg-white/5
          px-3 text-(--text-primary)
          transition-colors duration-200
          hover:border-orange-50/25 hover:bg-white/8
          focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/20
        "
      >
        <HugeiconsIcon
          icon={AddCircleIcon}
          size={16}
          strokeWidth={1.6}
          className="shrink-0 text-(--text-secondary) transition-colors duration-200 group-hover/new:text-(--text-primary)"
        />

        {/* Left aligned, in flow. It used to be absolutely centred on the pill,
            so the icon on the left and the kbd on the right pushed it visually
            left of centre. */}
        <span className="min-w-0 flex-1 truncate text-left text-[12.5px] font-medium tracking-tight">
          New workspace
        </span>

        <kbd
          className="
            ml-auto flex shrink-0 items-center gap-0.5 rounded-md
            border border-orange-50/15 bg-white/6 px-1.5 py-0.5
            font-mono text-[10px] text-(--text-secondary)
            opacity-0 transition-[opacity,transform] duration-200 ease-out
            translate-x-1
            group-hover/new:translate-x-0
            group-hover/new:opacity-100
          "
        >
          {isMac ? (
            <>
              <span className="text-[11px]">⌘</span>
              <span className="text-[9px]">⇧</span>
              <span>K</span>
            </>
          ) : (
            <>
              <span className="text-[9px]">Ctrl</span>
              <span className="text-[9px]">⇧</span>
              <span>K</span>
            </>
          )}
        </kbd>
      </button>
    </div>
  );
}
