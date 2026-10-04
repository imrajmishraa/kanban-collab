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
    console.warn(
      "[collab] VITE_WS_URL is not set. Set it to ws://localhost:3000/ws (local) or wss://…/ws (prod).",
    );
    return null;
  }

  const base = normalizeWsBase(envUrl);
  const params = new URLSearchParams({
    token,
    boardId,
  });

  return `${base}?${params.toString()}`;
}

/** Stable pastel-ish color from a user id (for awareness avatars). */
export function colorFromUserId(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 70% 55%)`;
}
