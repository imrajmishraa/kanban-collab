import { useSidebarState } from "@/features/dashboard";

/**
 * The rail preview's controller.
 *
 * Not a hook, because two components drive it: the navbar's rail icon starts a
 * preview, and the overlay that appears under it holds or ends it. A hook would
 * give each of them its own timers and origin, which is exactly how the preview
 * ended up closing itself.
 *
 * The preview is not a mode of its own in the store: `computeRail` reads `hover`
 * to give the sidebar its 288px preview width, so the mode is borrowed for the
 * duration and put back where it came from.
 */

/** How long the pointer may take to cross the gap between the icon and the overlay. */
const CLOSE_GRACE_MS = 140;

/**
 * How long the trigger is deaf after a close, so a pointer that is already sitting
 * on it cannot reopen what it just closed.
 */
const REOPEN_COOLDOWN_MS = 350;

type Origin = "hidden" | "collapsed";

let origin: Origin | null = null;
let closeTimer: number | null = null;
let closedAt = 0;

export function cancelClose(): void {
  if (closeTimer !== null) {
    window.clearTimeout(closeTimer);
    closeTimer = null;
  }
}

/** Start a preview. Only from a rail that is off the page; open is open. */
export function startPreview(): void {
  const rail = useSidebarState.getState();

  if (rail.mode !== "hidden" && rail.mode !== "collapsed") return;
  if (Date.now() - closedAt < REOPEN_COOLDOWN_MS) return;

  cancelClose();
  origin = rail.mode;
  rail.setMode("hover");
  rail.setHovering(true);
}

/** Put the mode back and remember when, for the cooldown. */
export function endPreview(): void {
  const rail = useSidebarState.getState();
  if (rail.mode !== "hover") return;

  rail.setMode(origin ?? "hidden");
  rail.setHovering(false);
  origin = null;
  closedAt = Date.now();
}

/** Close after the grace period, so the pointer can reach the overlay. */
export function scheduleEnd(): void {
  cancelClose();
  closeTimer = window.setTimeout(() => {
    closeTimer = null;
    endPreview();
  }, CLOSE_GRACE_MS);
}

/** A click inside the preview pins what the reader is looking at. */
export function pinPreview(): void {
  cancelClose();
  origin = null;
  useSidebarState.getState().openFromPreview();
}
