import { useSidebarState } from "@/features/dashboard";

/**
 * B2: the window's left edge is the second way in.
 *
 * Eight pixels, invisible, only where the rail is not open — a pointer parked against the
 * edge of a maximised window is almost always reaching for the navigation, and it costs
 * nothing to take that as a question rather than a miss.
 */
const EDGE = 8;

export function RailEdgeHotZone() {
  const mode = useSidebarState((state) => state.mode);
  const peek = useSidebarState((state) => state.peek);
  const unpeek = useSidebarState((state) => state.unpeek);

  if (mode === "open") return null;

  return (
    <div
      aria-hidden
      onMouseEnter={peek}
      onMouseLeave={unpeek}
      style={{ width: EDGE }}
      className="fixed inset-y-0 left-0 z-40"
    />
  );
}
