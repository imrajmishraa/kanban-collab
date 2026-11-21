/**
 * Card assignees have to be people who can see the card.
 *
 * `members[]` was a list of `ObjectId`s and nothing else: any id that parsed
 * was stored, so a card could be assigned to a user from another workspace, to a
 * deleted account, or to an id that never existed. The card then showed an
 * assignee nobody could resolve, and the notification fan-out wrote rows for a
 * user with no access to the card.
 *
 * Pure, so the rule is testable without a database: the caller has already
 * loaded the workspace's members, which it needs anyway for the permission
 * check.
 */
export function unknownCardMembers(
  requested: readonly string[],
  workspaceUserIds: ReadonlySet<string>,
): string[] {
  const unknown: string[] = [];

  for (const id of requested) {
    if (!workspaceUserIds.has(id)) {
      unknown.push(id);
    }
  }

  return unknown;
}
