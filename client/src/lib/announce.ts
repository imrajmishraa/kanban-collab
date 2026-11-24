/**
 * A polite live region for things a tooltip did.
 *
 * A tooltip is visual: "Copied!" appears, then goes. A screen reader gets nothing unless
 * something tells it — and it must not be the tooltip itself, because a tooltip that opens
 * and closes within a second is exactly the announcement a reader should not wait for.
 *
 * One region, reused, so ten announcements do not mean ten nodes.
 */
const REGION_ID = "tooltip-announcer";

function region(): HTMLElement {
  const existing = document.getElementById(REGION_ID);
  if (existing) return existing;

  const el = document.createElement("div");
  el.id = REGION_ID;
  el.setAttribute("aria-live", "polite");
  el.setAttribute("aria-atomic", "true");
  /* Off-screen, not `display:none` — a hidden node is not announced. */
  el.style.cssText =
    "position:fixed;top:-1px;left:-1px;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;";
  document.body.appendChild(el);
  return el;
}

export function announce(message: string): void {
  if (typeof document === "undefined" || !message) return;

  const el = region();
  /* Clearing first makes the same message announce twice in a row. */
  el.textContent = "";
  window.setTimeout(() => {
    el.textContent = message;
  }, 50);
}
