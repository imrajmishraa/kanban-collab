/**
 * Build the collaboration WebSocket URL.
 *
 * The URL carries only the (non-secret) board id:
 *   {WS_BASE}/ws?boardId=...
 *
 * The access token is NOT in the URL (H-2 / F-8). It travels in the
 * `Sec-WebSocket-Protocol` header via the `kanban.auth` subprotocol, so it never
 * lands in logs, proxies or browser history — and the URL stays stable across
 * token refreshes, which is what stops the 15-minute refresh from tearing the
 * Y.Doc down.
 *
 * VITE_WS_URL may already include the `/ws` path (see client/.env.example).
 */

/** Subprotocol name that carries the access token (matches the server). */
export const WS_AUTH_SUBPROTOCOL = "kanban.auth";

function normalizeWsBase(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (trimmed.endsWith("/ws")) {
    return trimmed;
  }
  return `${trimmed}/ws`;
}

export function buildCollaborationWsUrl(
  boardId: string | null | undefined,
): string | null {
  if (!boardId) {
    return null;
  }

  const envUrl = import.meta.env.VITE_WS_URL as string | undefined;
  if (!envUrl) {
    // No WS base configured — collaboration is simply disabled. The caller
    // treats a null URL as "do not connect", so this stays silent rather
    // than logging on every render.
    return null;
  }

  const base = normalizeWsBase(envUrl);
  const params = new URLSearchParams({ boardId });

  return `${base}?${params.toString()}`;
}
