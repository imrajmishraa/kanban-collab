/**
 * Which tooltips are actually read.
 *
 * A tooltip is invisible to analytics by nature — it never renders a page, never fires a
 * click. This is the one hook: `onShow` fires when a bubble opens and `onHide` when it
 * closes, with how long it stayed. A tooltip that opens for 80ms on every hover is telling
 * you it is noise.
 */
export interface TooltipEvent {
  /** A stable name the call site gives it: "due-date", "sync-status". */
  id: string;
  kind: "show" | "hide";
  /** How long it was open, for `hide`. */
  ms?: number;
}

type Listener = (event: TooltipEvent) => void;

const listeners = new Set<Listener>();

/** Subscribe to every tooltip's open and close. Returns the undo. */
export function onTooltipEvent(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitTooltipEvent(event: TooltipEvent): void {
  for (const listener of listeners) listener(event);
}
