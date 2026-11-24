/**
 * The tooltip bus — the rules that cannot live inside one component.
 *
 * Three of them need a view from outside a single bubble:
 *
 * - **one at a time.** A pointer crossing a toolbar can otherwise leave three bubbles open,
 *   stacked on each other.
 * - **nothing during a drag.** A tooltip appearing while a card is being dragged is noise,
 *   and it is positioned against an anchor that is moving.
 * - **nothing while a menu is open** — the caller says so through `suppressTooltips`.
 *
 * It is a module, not a context, because the drag flag lives on `document.body` and the
 * menu lives in a different tree; a context would have to be threaded through both.
 */

type Token = symbol;

let openToken: Token | null = null;
const closeListeners = new Map<Token, () => void>();

/** Claims the screen for this tooltip, closing whatever was open. */
export function claimTooltip(token: Token): void {
  if (openToken !== null && openToken !== token) {
    closeListeners.get(openToken)?.();
  }
  openToken = token;
}

export function releaseTooltip(token: Token): void {
  if (openToken === token) openToken = null;
}

/** Registers how this tooltip should be closed when another one claims the screen. */
export function onClosedByOther(token: Token, close: () => void): () => void {
  closeListeners.set(token, close);
  return () => closeListeners.delete(token);
}

/* ── Suppression ───────────────────────────────────────────────────────
   A counter, not a boolean: a drag and an open menu can overlap, and the first one to
   finish must not un-suppress while the other is still going. */

let suppressed = 0;
const suppressionListeners = new Set<() => void>();

function setSuppressed(next: boolean): void {
  const before = suppressed > 0;
  suppressed = Math.max(0, suppressed + (next ? 1 : -1));
  if (before !== suppressed > 0) {
    for (const listener of suppressionListeners) listener();
  }
}

export const tooltipsSuppressed = (): boolean => suppressed > 0;

/**
 * Suppress every tooltip while something else owns the pointer — an open menu, a modal
 * gesture, a drag that this module cannot see. Returns the undo.
 */
export function suppressTooltips(): () => void {
  setSuppressed(true);
  let done = false;
  return () => {
    if (done) return;
    done = true;
    setSuppressed(false);
  };
}

/** Called when suppression starts, so an open bubble can close itself. */
export function onSuppressionChange(listener: () => void): () => void {
  suppressionListeners.add(listener);
  return () => suppressionListeners.delete(listener);
}

/* ── Scrolling ─────────────────────────────────────────────────────────
   A bubble anchored to something that is being scrolled away is worse than no bubble: it
   floats over content it no longer describes. Any scroll closes the open one. Suppression is
   deliberately *not* used here — a tooltip should still open after the scroll stops. */

const scrollListeners = new Set<() => void>();

export function onScrollHide(listener: () => void): () => void {
  scrollListeners.add(listener);
  return () => scrollListeners.delete(listener);
}

/**
 * Targets already being watched. A `WeakSet` rather than a boolean, so the module can be
 * pointed at something other than `window` — a test has no `window`, and a future caller
 * might want to watch one scroll container instead of all of them.
 */
const watchedScrollTargets = new WeakSet<EventTarget>();

export function watchScrolls(
  target: EventTarget | null = typeof window === "undefined" ? null : window,
): void {
  if (!target || watchedScrollTargets.has(target)) return;
  watchedScrollTargets.add(target);

  const onScroll = () => {
    for (const listener of scrollListeners) listener();
  };

  /* Capture, because the app scrolls `<main>`, not the document. */
  target.addEventListener("scroll", onScroll, { capture: true, passive: true });
}

/* ── The drag flag ─────────────────────────────────────────────────────
   `AppLayout` already sets `data-resizing` on the shell and the dividers set
   `data-dragging` on `body`. Watching those two attributes is the whole integration: no
   component has to remember to tell the tooltip layer that a drag started. */

const DRAG_ATTRS = ["data-dragging", "data-resizing"] as const;

function isDragging(): boolean {
  if (typeof document === "undefined") return false;
  if (document.body.dataset.dragging === "true") return true;
  return document.querySelector("[data-resizing='true']") !== null;
}

let watching = false;
let dragActive = false;

function syncDragState(): void {
  const now = isDragging();
  if (now === dragActive) return;
  dragActive = now;
  setSuppressed(now);
}

/** Starts the watcher once, on the first tooltip that mounts. */
export function watchDrags(): void {
  if (watching || typeof document === "undefined") return;
  watching = true;

  const observer = new MutationObserver(syncDragState);
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: [...DRAG_ATTRS],
  });

  /* The shell is not `body`, so its own attribute needs a wider watch. */
  observer.observe(document.documentElement, {
    attributes: true,
    subtree: true,
    attributeFilter: [...DRAG_ATTRS],
  });
}
