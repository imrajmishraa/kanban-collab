import { Panel, Separator } from "react-resizable-panels";

import DashboardSidebar from "@/components/sidebar/DashboardSidebar";
import { usePanelState } from "@/stores/panelState";
import { SHELL } from "@/lib/shellLayout";
import { scheduleEnd, startPreview } from "@/layouts/railPreview";

import { dividerClass } from "./divider";
import { usePaneChrome } from "./PaneChromeContext";

/**
 * The rail: the pane, its divider, and the two things only this pane knows — that
 * a collapsed strip is its own preview trigger, and that a click on it means
 * "hidden" when it is open.
 *
 * The preview overlay itself is not here. A hidden rail is a 0px pane and the
 * pane clips, so the overlay has to live outside the group; the shell draws it.
 */
export default function LeftPanelLayout() {
  const { initial, separatorProps, setResizing } = usePaneChrome();

  const mode = usePanelState((s) => s.leftPanel.mode);
  const hovering = usePanelState((s) => s.leftPanel.hovering);
  const setMode = usePanelState((s) => s.leftPanel.setMode);

  const open = mode !== "hidden";
  const collapsed = mode === "collapsed";
  /* A preview is the pointer, not a mode: the reader's mode is untouched. */
  const previewing = hovering;

  return (
    <>
      <Panel
        id="leftPanel"
        defaultSize={initial.rail}
        minSize={0}
        maxSize={SHELL.left.max}
        collapsible
        collapsedSize={0}
        className="min-w-0 overflow-hidden"
      >
        {open && !previewing ? (
          <div
            /* Open, the rail sits on its own surface; the change is the colour
               transition, not a movement — see `.panel-surface`. */
            className="panel-surface h-full"
            data-open={open}
            /* Collapsed, the strip itself is the trigger: 72px of sidebar is what
               the pointer lands on, so the handler has to be on its wrapper. */
            onMouseEnter={collapsed ? startPreview : undefined}
            onMouseLeave={collapsed ? scheduleEnd : undefined}
          >
            <DashboardSidebar
              onToggle={() => setMode(open ? "hidden" : "expanded")}
              embedded
            />
          </div>
        ) : null}
      </Panel>

      <Separator
        {...separatorProps("left")}
        onPointerDown={() => {
          separatorProps("left").onPointerDown();
          setResizing(true);
        }}
        onPointerUp={() => setResizing(false)}
        className={dividerClass(open, false)}
        /* Inline: `base.css` sets `cursor: pointer` unlayered, and unlayered CSS
           beats every Tailwind `@layer utilities` class. */
        style={{ cursor: open ? "col-resize" : undefined }}
        aria-label="Resize the rail"
        aria-controls="leftPanel"
        aria-valuenow={usePanelState.getState().leftPanel.width}
        aria-valuemin={collapsed ? SHELL.left.collapsed : SHELL.left.min}
        aria-valuemax={SHELL.left.max}
        disabled={!open}
      />
    </>
  );
}
