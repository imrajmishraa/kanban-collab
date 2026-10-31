/**
 * Transaction origins used across the collaboration layer (T9).
 *
 * A Yjs transaction carries an "origin" so listeners can tell where an update
 * came from and avoid echoing it back:
 *
 *   - `ORIGIN_LOCAL`  — produced by this client's own edits. The provider
 *                       forwards these to the server.
 *   - `ORIGIN_REMOTE` — applied from the network (or Redis on the server).
 *                       The provider must NOT send these back out.
 *
 * Using constants instead of bare strings keeps the guard rails greppable and
 * stops a typo ("remotee") from silently disabling the echo guard.
 */
export const ORIGIN_LOCAL = "local";
export const ORIGIN_REMOTE = "remote";

/** Origin used by the server when re-applying an update from Redis pub/sub. */
export const ORIGIN_REDIS = "redis";
