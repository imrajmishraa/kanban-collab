/**
 * Board visibility × workspace role, in one table.
 *
 * `Board.visibility` has had three values since the schema was written, and only
 * one combination was ever enforced: the WebSocket upgrade refused `private` +
 * `guest`. Everywhere else the rule was "is this user a member?", which made
 * `public`, `workspace` and `private` behave identically for members, and made
 * `admin` and `member` behave identically everywhere.
 *
 * The decision this encodes, taken 20 Nov:
 *
 *   private   — the workspace's full members (owner, admin, member). A guest is
 *               not shown a private board at all, on any surface.
 *   workspace — anyone in the workspace, guests included, read-only for guests.
 *   public    — anyone holding the link, member or not, guest or not.
 *
 * Write and manage are role-only: visibility widens who may *read*, never who
 * may write. A public board is not a wiki.
 */

export type BoardVisibility = "private" | "workspace" | "public";

export type WorkspaceRole = "owner" | "admin" | "member" | "guest";

/**
 * What a caller is trying to do.
 *
 * `read`   — see the board and its cards
 * `write`  — change content: rename the board, add or edit columns and cards
 * `manage` — destroy structure: delete the board, delete a column
 */
export type BoardCapability = "read" | "write" | "manage";

/**
 * Roles that may change content. `guest` is the only read-only role, and it is
 * the only one that has ever been refused — this keeps that behaviour and gives
 * it a name.
 */
const WRITERS: readonly WorkspaceRole[] = ["owner", "admin", "member"];

/**
 * Roles that may destroy structure.
 *
 * Until now every writer could delete a board, which is the one action a member
 * cannot undo. Restricting it to owner and admin is what finally makes `admin`
 * mean something.
 */
const MANAGERS: readonly WorkspaceRole[] = ["owner", "admin"];

/**
 * May this caller read a board?
 *
 * `role` is `null` for a caller who is not in the workspace at all — the public
 * case, and the only one where visibility alone decides.
 */
export function canReadBoard(
  visibility: BoardVisibility,
  role: WorkspaceRole | null,
): boolean {
  if (visibility === "public") return true;

  if (role === null) return false;

  if (visibility === "workspace") return true;

  /* private: a guest is not in this conversation. */
  return role !== "guest";
}

/** May this caller change content? Visibility never widens this. */
export function canWriteBoard(role: WorkspaceRole | null): boolean {
  return role !== null && WRITERS.includes(role);
}

/** May this caller delete the board or one of its columns? */
export function canManageBoard(role: WorkspaceRole | null): boolean {
  return role !== null && MANAGERS.includes(role);
}

/** Every capability this caller has, for a client that wants to hide controls. */
export function boardCapabilities(
  visibility: BoardVisibility,
  role: WorkspaceRole | null,
): BoardCapability[] {
  const granted: BoardCapability[] = [];

  if (canReadBoard(visibility, role)) granted.push("read");
  if (canWriteBoard(role)) granted.push("write");
  if (canManageBoard(role)) granted.push("manage");

  return granted;
}

/**
 * The single capability check, for call sites that would otherwise pick the
 * wrong predicate. Throws nothing — callers own their error codes, because the
 * surfaces deliberately differ (404 when a board's existence must not leak, 403
 * when the caller can already see it).
 */
export function can(
  capability: BoardCapability,
  visibility: BoardVisibility,
  role: WorkspaceRole | null,
): boolean {
  switch (capability) {
    case "read":
      return canReadBoard(visibility, role);
    case "write":
      return canWriteBoard(role);
    case "manage":
      return canManageBoard(role);
  }
}
