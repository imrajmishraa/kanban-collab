export type ActivityType =
  | "board_created"
  | "board_updated"
  | "card_created"
  | "card_updated"
  | "card_moved"
  | "member_joined"
  | "member_invited";

export interface Activity {
  id: string;
  type: ActivityType;
  userId: string;
  workspaceId: string;
  boardId?: string;
  message: string;
  createdAt: string;
}
