import { useCallback, useEffect, useRef } from "react";

import { useSidebarState } from "@/features/dashboard";

/** How long the pointer may take to cross the gap between the trigger and the overlay. */
const CLOSE_GRACE_MS = 140;

/**
 * How long the edge is deaf after a close.
 *
 * Without it the shell bounced: the overlay closed, the pointer was back over the
 * 8px strip that opened it, the strip fired `mouseenter`, the overlay opened, and
 * so on — open, close, open, as long as the pointer rested near the edge. The
 * cooldown is what breaks that cycle; a reader who moves away and comes back after
 * this window gets the preview again.
 */
const REOPEN_COOLDOWN_MS = 350;

type Origin = "hidden" | "collapsed";

/**
 * The rail's hover preview, as one controller.
 *
 * The preview is not a mode of its own: `computeRail` reads `hover` to give the
 * sidebar its 288px preview width, so the mode is borrowed for the duration and
 * put back where it came from. Everything about *when* it opens and closes lives
 * here, so the edge, the strip and the overlay cannot disagree.
 */
export function useRailPreview() {
  const origin = useRef<Origin | null>(null);
  const closeTimer = useRef<number | null>(null);
  const closedAt = useRef(0);

  const cancelClose = useCallback(() => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const startPreview = useCallback(() => {
    const rail = useSidebarState.getState();

    /* Only a rail that is off the page previews. Open is open; previewing is
       already previewing. */
    if (rail.mode !== "hidden" && rail.mode !== "collapsed") return;

    /* The pointer is still where the last close left it — the bounce. */
    if (Date.now() - closedAt.current < REOPEN_COOLDOWN_MS) return;

    cancelClose();
    origin.current = rail.mode;
    rail.setMode("hover");
    rail.setHovering(true);
  }, [cancelClose]);

  const endPreview = useCallback(() => {
    const rail = useSidebarState.getState();
    if (rail.mode !== "hover") return;

    rail.setMode(origin.current ?? "hidden");
    rail.setHovering(false);
    origin.current = null;
    closedAt.current = Date.now();
  }, []);

  const scheduleEnd = useCallback(() => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      endPreview();
    }, CLOSE_GRACE_MS);
  }, [cancelClose, endPreview]);

  useEffect(() => cancelClose, [cancelClose]);

  return { startPreview, scheduleEnd, cancelClose, endPreview };
}
