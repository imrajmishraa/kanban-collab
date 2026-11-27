/**
 * How the rail behaves — the whole vocabulary, in one place.
 *
 * collapsed icons only, always
 * expanded  the rail at its stored width, pushing the page
 * hidden    not on the page at all; the navbar toggle is the way back
 *
 * A preview is not a fourth mode: hovering shows the rail over the page while the
 * mode stays where it was, so nothing has to be restored afterwards and no
 * transient value can be persisted. `hovering` is that flag.
 */
export type SidebarMode = "collapsed" | "expanded" | "hidden";

const MODES: readonly SidebarMode[] = ["collapsed", "expanded", "hidden"];

export const isMode = (value: unknown): value is SidebarMode =>
  MODES.includes(value as SidebarMode);

/** Modes that show the rail, and so are worth restoring to. */
export type VisibleMode = "expanded" | "collapsed";

/*
 * `lastVisible` is what the toggle brings back, so only a real mode may set it: a
 * preview is a glance, not a place to return to.
 */
export const isVisibleMode = (value: unknown): value is VisibleMode =>
  value === "expanded" || value === "collapsed";
