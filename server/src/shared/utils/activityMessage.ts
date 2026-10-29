/**
 * Human-readable line for an activity log entry.
 *
 * Shared by the dashboard read model and the paginated activity feed so both
 * describe the same event the same way. `COMMENT_ADD` was missing, which is why
 * a new comment surfaced as the raw action name.
 */
export function createActivityMessage(
  actionType: string,
  details: unknown,
  boardName?: string,
): string {
  const detailsRecord =
    typeof details === "object" && details !== null
      ? (details as Record<string, unknown>)
      : {};

  const title =
    typeof detailsRecord["title"] === "string"
      ? detailsRecord["title"]
      : typeof detailsRecord["name"] === "string"
        ? detailsRecord["name"]
        : undefined;

  const preview =
    typeof detailsRecord["preview"] === "string"
      ? detailsRecord["preview"].trim()
      : "";

  switch (actionType) {
    case "BOARD_CREATE":
    case "BOARD_CREATED":
      return `Created board "${boardName ?? title ?? "Untitled"}"`;

    case "BOARD_UPDATE":
    case "BOARD_UPDATED":
      return `Updated board "${boardName ?? title ?? "Untitled"}"`;

    case "CARD_CREATE":
    case "CARD_CREATED":
      return `Created card "${title ?? "Untitled"}"`;

    case "CARD_UPDATE":
    case "CARD_UPDATED":
      return `Updated card "${title ?? "Untitled"}"`;

    case "CARD_MOVE":
      return `Moved card "${title ?? "Untitled"}"`;

    case "CARD_DELETE":
    case "CARD_DELETED":
      return `Deleted card "${title ?? "Untitled"}"`;

    case "CARD_ASSIGN":
      return `Assigned someone to "${title ?? "a card"}"`;

    case "CARD_UNASSIGN":
      return `Unassigned someone from "${title ?? "a card"}"`;

    case "COMMENT_ADD":
      return preview ? `Commented "${preview}"` : "Commented on a card";

    case "COMMENT_DELETE":
      return "Deleted a comment";

    case "COLUMN_CREATE":
      return `Created column "${title ?? "Untitled"}"`;

    case "COLUMN_UPDATE":
      return `Updated column "${title ?? "Untitled"}"`;

    case "COLUMN_DELETE":
      return `Deleted column "${title ?? "Untitled"}"`;

    case "MEMBER_INVITE":
      return "Invited a member";

    case "MEMBER_REMOVE":
      return "Removed a member";

    case "MEMBER_ROLE_CHANGE":
      return "Changed a member's role";

    default:
      return actionType.toLowerCase().replace(/_/g, " ");
  }
}
