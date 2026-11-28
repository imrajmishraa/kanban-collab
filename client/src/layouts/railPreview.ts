import { usePanelState } from "@/stores/panelState";

/**
 * The rail preview's controller.
 *
 * Not a hook, because two components drive it: the navbar's rail icon starts a
 * preview, and the overlay that appears under it holds or ends it. A hook would
 * give each of them its own timers and origin, which is exactly how the preview
 * ended up closing itself.
 *
 * The preview is not a mode: `computeRail` reads the `hovering` flag to give the
 * sidebar its 288px preview width, and the reader's mode stays exactly where they
 * left it.
 */

/** How long the pointer may take to cross the gap between the icon and the overlay. */
const CLOSE_GRACE_MS = 140;

/**
 * How long the trigger is deaf after a close, so a pointer that is already sitting
 * on it cannot reopen what it just closed.
 */
const REOPEN_COOLDOWN_MS = 350;

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
  const rail = usePanelState.getState().leftPanel;

  /* Only a rail that is off the page previews. Expanded is expanded. */
  if (rail.mode !== "hidden" && rail.mode !== "collapsed") return;
  if (Date.now() - closedAt < REOPEN_COOLDOWN_MS) return;

  cancelClose();
  /* The mode is not borrowed: the preview is the flag, so nothing has to be put
     back when it ends — and nothing transient can be persisted. */
  rail.setHovering(true);
}

/** Put the mode back and remember when, for the cooldown. */
export function endPreview(): void {
  const rail = usePanelState.getState().leftPanel;
  if (!rail.hovering) return;

  rail.setHovering(false);
  closedAt = Date.now();
}

/** Close after the grace period, so the pointer can reach the overlay. */
export function scheduleEnd(): void {
  /* Already pending? Leave it. Restarting on every call meant a pointer that was
     still moving — or a browser re-firing a move after a layout change — pushed
     the deadline ahead of itself, and the preview only closed once the pointer
     happened to stop for the whole grace period. */
  if (closeTimer !== null) return;

  closeTimer = window.setTimeout(() => {
    closeTimer = null;
    endPreview();
  }, CLOSE_GRACE_MS);
}

/** A click inside the preview pins what the reader is looking at. */
export function pinPreview(): void {
  cancelClose();
  usePanelState.getState().leftPanel.openFromPreview();
}
