/**
 * Close codes the server uses to say *why* it ended a socket.
 *
 * The client used to treat every close the same way and reconnect. That is right
 * for a network blip and wrong for a revoked session: `4003` is sent when a
 * member is removed from a workspace, demoted, or leaves — the upgrade that
 * follows would be refused by `authorize` anyway, so reconnecting only produces a
 * refused handshake every backoff interval.
 *
 * Only `4003` is terminal here on purpose. `4001` (unauthorized) and `4004`
 * (session expired) are recoverable: the access token may simply need a refresh,
 * and a fresh socket re-reads it on connect.
 */
export const WS_CLOSE_CODE_ACCESS_REVOKED = 4003;

/**
 * Access changed rather than ended: a demotion, a promotion, or a board that
 * just became private. The socket is still entitled to exist — it just has to be
 * authorised against the new role — so it reconnects. Sending `4003` for these
 * killed live editing until a reload.
 */
export const WS_CLOSE_CODE_ACCESS_CHANGED = 4006;

/** True when the socket should stay closed instead of reconnecting. */
export function isAccessRevokedClose(code: number): boolean {
  return code === WS_CLOSE_CODE_ACCESS_REVOKED;
}

/** True when the socket should come back with the access it now has. */
export function isAccessChangedClose(code: number): boolean {
  return code === WS_CLOSE_CODE_ACCESS_CHANGED;
}
