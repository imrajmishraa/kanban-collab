import { useEffect, useRef, useState } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import { AddCircleIcon } from "@hugeicons/core-free-icons";
import { useNewWorkspaceDialog } from "./newWorkspaceDialog.context";

interface SidebarNewWorkspaceProps {
  collapsed: boolean;
}

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad|iPod/.test(navigator.platform);

export default function SidebarNewWorkspace({
  collapsed,
}: SidebarNewWorkspaceProps) {
  const { open } = useNewWorkspaceDialog();

  const buttonRef = useRef<HTMLButtonElement>(null);
  const [tooltip, setTooltip] = useState<{ top: number; left: number } | null>(
    null,
  );

  const handleCreate = () => open();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const modKey = isMac ? event.metaKey : event.ctrlKey;
      // Require Shift — ⌘K belongs to search, ⌘⇧K opens new workspace
      if (modKey && event.shiftKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        open();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const handleMouseEnter = () => {
    if (!collapsed) return;

    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    setTooltip({
      top: rect.bottom, // 6px below the button
      left: rect.right + 2, // left-aligned with the button
    });
  };

  const handleMouseLeave = () => setTooltip(null);

  /* ── Collapsed ──────────────────────────────────────────── */
  if (collapsed) {
    return (
      <>
        <div className="shrink-0 px-2 pt-3">
          <button
            ref={buttonRef}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleCreate();
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            aria-label="New workspace"
            className="
              mx-auto flex size-9 cursor-pointer items-center justify-center
              rounded-full border border-white/8 bg-white/6
              text-(--text-primary)
              transition-colors duration-200
              hover:bg-white/10
            "
          >
            <HugeiconsIcon icon={AddCircleIcon} size={18} strokeWidth={1.6} />
          </button>
        </div>

        {tooltip && (
          <div
            role="tooltip"
            className="pointer-events-none fixed z-50"
            style={{ top: tooltip.top, left: tooltip.left }}
          >
            <div
              className="
                flex items-center gap-2 whitespace-nowrap
                rounded-md border border-white/12 bg-(--bg-elevated)
                px-2.5 py-1.5
                font-mono text-[11px] text-white/85
                shadow-[0_8px_20px_-6px_rgba(0,0,0,0.7)]
              "
            >
              <span>New workspace</span>

              <kbd
                className="
                  flex items-center gap-0.5 rounded border border-white/12
                  bg-white/6 px-1 py-0.5
                  font-mono text-[9px] text-white/70
                "
              >
                {isMac ? (
                  <>
                    <span className="text-[10px] leading-none">⌘</span>
                    <span className="leading-none">⇧</span>
                    <span className="leading-none">K</span>
                  </>
                ) : (
                  <>
                    <span className="leading-none">Ctrl</span>
                    <span className="leading-none">⇧</span>
                    <span className="leading-none">K</span>
                  </>
                )}
              </kbd>
            </div>
          </div>
        )}
      </>
    );
  }

  /* ── Expanded ───────────────────────────────────────────── */
  return (
    <div className="shrink-0 px-3 pt-3 pb-2">
      <button
        type="button"
        onClick={handleCreate}
        className="
          group/new relative flex h-9 w-full cursor-pointer items-center
          rounded-full border border-white/8 bg-white/6
          px-3 text-(--text-primary)
          transition-colors duration-200
          hover:bg-white/10
        "
      >
        <HugeiconsIcon
          icon={AddCircleIcon}
          size={16}
          strokeWidth={1.6}
          className="shrink-0"
        />

        <span className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[13px]">
          New workspace
        </span>

        <kbd
          className="
            ml-auto flex items-center gap-0.5 rounded-lg border border-white/10
            bg-white/6 px-1.5 py-0.5 font-mono text-[10px]
            text-(--text-secondary)
            opacity-0 transition-all duration-200 ease-out
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
