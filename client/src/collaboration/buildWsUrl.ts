/**
 * Build the collaboration WebSocket URL.
 *
 * Server expects:
 *   {WS_BASE}/ws?token=...&boardId=...
 *
 * VITE_WS_URL may already include the `/ws` path
 * (see client/.env.example).
 */

function normalizeWsBase(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (trimmed.endsWith("/ws")) {
    return trimmed;
  }
  return `${trimmed}/ws`;
}

export function buildCollaborationWsUrl(
  boardId: string | null | undefined,
  token: string | null | undefined,
): string | null {
  if (!boardId || !token) {
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
  const params = new URLSearchParams({
    token,
    boardId,
  });

  return `${base}?${params.toString()}`;
}
