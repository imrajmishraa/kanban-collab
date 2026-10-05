export type ActivityActionType =
  | "CARD_CREATE"
  | "CARD_UPDATE"
  | "CARD_MOVE"
  | "CARD_ARCHIVE"
  | "CARD_DELETE"
  | "CARD_ASSIGN"
  | "CARD_UNASSIGN"
  | "COMMENT_ADD"
  | "COMMENT_DELETE"
  | "COLUMN_CREATE"
  | "COLUMN_UPDATE"
  | "COLUMN_DELETE"
  | "BOARD_CREATE"
  | "BOARD_UPDATE"
  | "BOARD_DELETE"
  | "MEMBER_INVITE"
  | "MEMBER_REMOVE"
  | "MEMBER_ROLE_CHANGE";

export interface ActivityEntry {
  id: string;
  boardId: string;
  userId: string;
  actorName: string;
  actorAvatarUrl: string | null;
  actionType: ActivityActionType;
  details: Record<string, unknown>;
  createdAt: string;
}
