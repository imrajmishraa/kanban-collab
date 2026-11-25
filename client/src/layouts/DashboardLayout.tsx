import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Group,
  Panel,
  Separator,
  usePanelRef,
  type Layout,
} from "react-resizable-panels";
import {
  panelConfigByDevice,
  percentOf,
  type PanelDevice,
} from "@/lib/panelConfig";

interface Props {
  device: PanelDevice;
  children: ReactNode; // centre / page
  left: ReactNode; // sidebar
  right: ReactNode; // inspector / details
  leftVisible: boolean;
  rightOpen: boolean;
  onLeftVisibleChange?: (v: boolean) => void;
  onRightOpenChange?: (v: boolean) => void;
  onSizes?: (s: { left: number; centre: number; right: number }) => void;
}

export default function DashboardLayout({
  device,
  children,
  left,
  right,
  leftVisible,
  rightOpen,
  onSizes,
}: Props) {
  const config = panelConfigByDevice[device];
  const leftRef = usePanelRef();
  const centreRef = usePanelRef();
  const rightRef = usePanelRef();
  const groupEl = useRef<HTMLDivElement>(null);

  const [defaultLayout] = useState<Layout>(() => {
    const l = percentOf(config.leftPanel.defaultSize);
    const r = percentOf(config.rightPanel.defaultSize);
    return {
      leftPanel: leftVisible ? l : 0,
      centreLayout: Math.max(
        0,
        100 - (leftVisible ? l : 0) - (rightOpen ? r : 0),
      ),
      rightPanel: rightOpen ? r : 0,
    };
  });

  // Left show / hide
  useEffect(() => {
    const p = leftRef.current;
    if (!p) return;

    if (leftVisible) {
      p.expand();
    } else {
      p.collapse();
    }
  }, [leftVisible, leftRef]);

  // Right show / hide
  useEffect(() => {
    const p = rightRef.current;
    if (!p) return;

    if (rightOpen) {
      p.expand();
    } else {
      p.collapse();
    }
  }, [rightOpen, rightRef]);

  const report = useCallback(
    (layout: Layout) => {
      const width = groupEl.current?.clientWidth ?? 0;
      if (!width) return;
      const px = (id: string) => Math.round(((layout[id] ?? 0) / 100) * width);
      onSizes?.({
        left: px("leftPanel"),
        centre: px("centreLayout"),
        right: px("rightPanel"),
      });
    },
    [onSizes],
  );

  if (device === "mobile") {
    return <div className="h-full min-h-0">{children}</div>;
  }

  return (
    <div ref={groupEl} className="min-h-0 flex-1">
      <Group
        orientation="horizontal"
        className="h-full"
        defaultLayout={defaultLayout}
        onLayoutChange={report}
      >
        {/* ── LEFT ── */}
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
          {left}
        </Panel>

        <Separator className="w-px shrink-0" />

        {/* ── CENTRE ── */}
        <Panel
          id="centreLayout"
          panelRef={centreRef}
          minSize={config.centreLayout.minSize}
          maxSize={rightOpen ? config.centreLayout.maxSize : "100%"}
          className="min-w-0"
        >
          {children}
        </Panel>

        <Separator className="w-px shrink-0" />

        {/* ── RIGHT ── */}
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
          {right}
        </Panel>
      </Group>
    </div>
  );
}
