export interface DashboardStats {
  workspaceCount: number;
  boardCount: number;
  activeTaskCount: number;
}

export interface DashboardWorkspace {
  id: string;
  name: string;
  boardCount: number;
  activeTaskCount: number;
}

export interface DashboardBoard {
  id: string;
  workspaceId: string;
  workspaceName: string;
  name: string;
  backgroundColor: string;
  updatedAt: string;
}

export interface DashboardResponse {
  stats: DashboardStats;
  workspaces: DashboardWorkspace[];
  recentBoards: DashboardBoard[];
  recentActivity: DashboardActivity[];
}

export type DashboardActivityType =
  | "board_created"
  | "board_updated"
  | "card_created"
  | "card_updated"
  | "card_completed"
  | "member_added";

export interface DashboardActivity {
  id: string;
  type: DashboardActivityType;
  message: string;
  workspaceId: string;
  workspaceName: string;
  boardId?: string;
  boardName?: string;
  createdAt: string;
}