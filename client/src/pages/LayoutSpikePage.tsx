import { useCallback, useEffect, useRef, useState } from "react";
import {
  Group,
  Panel,
  Separator,
  usePanelRef,
  type Layout,
} from "react-resizable-panels";

import { panelConfigByDevice, percentOf } from "@/lib/panelConfig";
import { deviceFor, MOBILE_MAX_VIEWPORT } from "@/lib/layoutRules";
import { useViewportWidth } from "./layout-spike/useViewportWidth";
import { SpikeBar } from "./layout-spike/SpikeBar";
import { RuleReadout } from "./layout-spike/RuleReadout";
import { BoardPlaceholder } from "./layout-spike/BoardPlaceholder";

export default function LayoutSpikePage() {
  const viewport = useViewportWidth();
  const device = deviceFor(viewport);
  const config = panelConfigByDevice[device === "mobile" ? "desktop" : device];

  const [leftVisible, setLeftVisible] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [showRules, setShowRules] = useState(true);
  const [sizes, setSizes] = useState({ left: 0, centre: 0, right: 0 });

  const leftRef = usePanelRef();
  const centreRef = usePanelRef();
  const rightRef = usePanelRef();
  const groupEl = useRef<HTMLDivElement>(null);

  const [defaultLayout] = useState<Layout>(() => {
    const l = percentOf(config.leftPanel.defaultSize);
    const r = percentOf(config.rightPanel.defaultSize);
    return {
      leftPanel: l,
      centreLayout: Math.max(0, 100 - l - r),
      rightPanel: r,
    };
  });

  // Left show / hide
  useEffect(() => {
    const p = leftRef.current;
    if (!p) return;
    if (leftVisible) p.expand();
    else p.collapse();
  }, [leftVisible, leftRef]);

  // Right show / hide
  useEffect(() => {
    const p = rightRef.current;
    if (!p) return;
    if (rightOpen) p.expand();
    else p.collapse();
  }, [rightOpen, rightRef]);

  const report = useCallback((layout: Layout) => {
    const width = groupEl.current?.clientWidth ?? 0;
    if (!width) return;
    const px = (id: string) => Math.round(((layout[id] ?? 0) / 100) * width);
    setSizes({
      left: px("leftPanel"),
      centre: px("centreLayout"),
      right: px("rightPanel"),
    });
  }, []);

  if (device === "mobile") {
    return (
      <p className="grid h-dvh place-items-center bg-(--bg-root) p-6 text-center text-(--text-primary)">
        Below {MOBILE_MAX_VIEWPORT}px — no group. Column = full-screen sheet.
      </p>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-(--bg-root) text-(--text-primary)">
      <SpikeBar
        device={device}
        viewport={viewport}
        sizes={[sizes.left, sizes.centre, sizes.right]}
        railVisible={leftVisible}
        panelOpen={rightOpen}
        showRules={showRules}
        onToggleRail={() => setLeftVisible((v) => !v)}
        onTogglePanel={() => setRightOpen((v) => !v)}
        onToggleRules={() => setShowRules((v) => !v)}
      />

      <div ref={groupEl} className="min-h-0 flex-1">
        <Group
          orientation="horizontal"
          className="h-full"
          defaultLayout={defaultLayout}
          onLayoutChange={report}
        >
          {/* LEFT */}
          <Panel
            id="leftPanel"
            panelRef={leftRef}
            defaultSize={config.leftPanel.defaultSize}
            minSize={leftVisible ? config.leftPanel.minSize : 0}
            maxSize={leftVisible ? config.leftPanel.maxSize : "0%"}
            collapsible
            collapsedSize={0}
            collapsedThreshold={9999}
            className="min-w-0"
          >
            <div className="flex h-full flex-col border-r border-(--hairline) bg-(--bg-surface) p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-(--text-muted)">
                Left / Rail
              </p>
              <p className="mt-2 text-sm text-(--text-primary)">
                Sidebar content
              </p>
            </div>
          </Panel>

          <Separator className="w-px shrink-0" />

          {/* CENTRE */}
          <Panel
            id="centreLayout"
            panelRef={centreRef}
            minSize={config.centreLayout.minSize}
            maxSize={rightOpen ? config.centreLayout.maxSize : "100%"}
            className="min-w-0"
          >
            <BoardPlaceholder />
          </Panel>

          <Separator className="w-px shrink-0" />

          {/* RIGHT */}
          <Panel
            id="rightPanel"
            panelRef={rightRef}
            defaultSize={config.rightPanel.defaultSize}
            minSize={rightOpen ? config.rightPanel.minSize : 0}
            maxSize={rightOpen ? config.rightPanel.maxSize : "0%"}
            collapsible
            collapsedSize={0}
            className="min-w-0"
          >
            <div className="flex h-full flex-col border-l border-(--hairline) bg-(--bg-surface) p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-(--text-muted)">
                Right / Panel
              </p>
              <p className="mt-2 text-sm text-(--text-primary)">
                Inspector content
              </p>
            </div>
          </Panel>
        </Group>
      </div>

      {showRules && (
        <RuleReadout
          device={device}
          viewport={viewport}
          sizes={sizes}
          railVisible={leftVisible}
          panelOpen={rightOpen}
        />
      )}
    </div>
  );
}
