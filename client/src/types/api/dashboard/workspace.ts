export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  ownerId: string;
  members: WorkspaceMember[];
  status: "active" | "deletion_pending";
  deletionRequestedAt: string | null;
  deletionScheduledFor: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  userId: string;
  role: "owner" | "admin" | "member" | "guest";
}

export interface WorkspacePagination {
  page: number;
  limit: number;
  totalWorkspaces: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CreateWorkspacePayload {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateWorkspacePayload {
  name?: string;
  slug?: string;
  description?: string;
}

export interface AddWorkspaceMemberPayload {
  email: string;
  role?: "admin" | "member" | "guest";
}

export interface WorkspaceDeletionResponse {
  workspaceId: string;
  status: string;
  deletionRequestedAt: string;
  deletionScheduledFor: string;
}

export interface ListWorkspacesParams {
  search?: string;
  page?: number;
  limit?: number;
}
