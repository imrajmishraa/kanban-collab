/**
 * The client's copy of the server's board permission table.
 *
 * `server/src/application/boards/boardAccess.ts` is the authority — every route
 * checks it, and it is the one with tests. This copy exists only so the UI can
 * stop offering an action that will answer 403; when the two disagree, the
 * server wins and the user sees the error.
 *
 * Kept as a plain module (no hooks, no imports) so it can be tested without a
 * DOM, which is the only kind of test this repo can run everywhere.
 */

export type WorkspaceRole = "owner" | "admin" | "member" | "guest";

/** Deleting a board or a column, and changing a board's visibility. */
export function canManageWorkspaceContent(role: WorkspaceRole | null): boolean {
  return role === "owner" || role === "admin";
}

/** Every role except `guest` may change content. */
export function canWriteWorkspaceContent(role: WorkspaceRole | null): boolean {
  return role === "owner" || role === "admin" || role === "member";
}
