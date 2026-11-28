import { Panel, Separator } from "react-resizable-panels";

import RightPanel from "@/components/layout/RightPanel";
import { usePanelState } from "@/stores/panelState";
import { SHELL } from "@/lib/shellLayout";

import { dividerClass } from "./divider";
import { usePaneChrome } from "./PaneChromeContext";

/**
 * The column on the right: the pane, its divider, and the width the column itself
 * reports back while it is being dragged.
 */
export default function RightPanelLayout() {
  const { initial, separatorProps, setResizing } = usePaneChrome();

  const mode = usePanelState((s) => s.rightPanel.mode);
  const width = usePanelState((s) => s.rightPanel.width);
  const railOpen = usePanelState((s) => s.leftPanel.mode !== "hidden");
  const railPx = usePanelState((s) => s.leftPanel.width);

  const open = mode !== "off";

  return (
    <>
      <Separator
        {...separatorProps("right")}
        onPointerDown={() => {
          separatorProps("right").onPointerDown();
          setResizing(true);
        }}
        onPointerUp={() => setResizing(false)}
        className={dividerClass(open, true)}
        style={{ cursor: open ? "col-resize" : undefined }}
        aria-label="Resize the column"
        aria-controls="rightPanel"
        aria-valuenow={width}
        aria-valuemin={SHELL.right.min}
        aria-valuemax={SHELL.right.max}
        disabled={!open}
      />

      <Panel
        id="rightPanel"
        defaultSize={initial.column}
        minSize={0}
        maxSize="100%"
        collapsible
        collapsedSize={0}
        className="min-w-0 overflow-hidden"
      >
        {open ? (
          <RightPanel
            appRailWidth={railOpen ? railPx : 0}
            embedded
            onResizeStart={() => setResizing(true)}
            onResizeEnd={() => setResizing(false)}
          />
        ) : null}
      </Panel>
    </>
  );
}
