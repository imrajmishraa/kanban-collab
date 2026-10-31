export type NotificationType =
  | "CARD_ASSIGNED"
  | "CARD_MOVED"
  | "CARD_DUE_SOON"
  | "CARD_OVERDUE"
  | "COMMENT_ADDED"
  | "MENTION"
  | "WORKSPACE_INVITE"
  | "WORKSPACE_ROLE_CHANGED"
  | "WORKSPACE_DELETION_SCHEDULED"
  | "BOARD_SHARED";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  workspaceId: string;
  boardId: string | null;
  cardId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: AppNotification[];
  unreadCount: number;
}
