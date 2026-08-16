export interface DashboardWorkspace {
  id: string;
  name: string;
  boardCount: number;
  activeTaskCount: number;
}

export interface DashboardStats {
  workspaceCount: number;
  boardCount: number;
  activeTaskCount: number;
}

export interface DashboardResponse {
  stats: DashboardStats;
  workspaces: DashboardWorkspace[];
}
