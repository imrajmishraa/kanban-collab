import { useCallback, useRef } from "react";
import type { ReactNode } from "react";

import { Panel } from "react-resizable-panels";

import DashboardNavbar from "@/components/sidebar/DashboardNavbar";
import { usePanelState } from "@/stores/panelState";

/**
 * The board's column: the bar, the page, and where the reader left it.
 *
 * The width is not here because there is no width to choose — `100 − rail − column`
 * is the answer, computed once in `lib/shellLayout.ts`. What this pane owns is the
 * scroll position, and the routed page it carries: `children` stays a prop, so a
 * navigation re-renders this pane rather than writing to a store.
 */
export default function CentrePanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  const setScrollTop = usePanelState((s) => s.centrePanel.setScrollTop);
  const scrolled = useRef(0);

  /* One write per frame at most: the store is not a scroll log. */
  const onScroll = useCallback(
    (event: React.UIEvent<HTMLElement>) => {
      const next = event.currentTarget.scrollTop;
      if (Math.abs(next - scrolled.current) < 24) return;

      scrolled.current = next;
      setScrollTop(next);
    },
    [setScrollTop],
  );

  return (
    <Panel
      id="centreLayout"
      minSize={0}
      maxSize="100%"
      collapsible
      collapsedSize={0}
      className="min-w-0"
    >
      <main
        className="flex h-full flex-col overflow-y-auto scroll-smooth"
        onScroll={onScroll}
      >
        {/* The bar belongs to the board's column: the rail and the column are its
            neighbours, not its parents. Its own sentinel scrolls away above it,
            which is what turns on the blurred background. */}
        <DashboardNavbar embedded />

        {/* `fixed` takes the bar out of the flow, so its height is reserved here. */}
        <div className="flex-1 pt-12">{children}</div>
      </main>
    </Panel>
  );
}
