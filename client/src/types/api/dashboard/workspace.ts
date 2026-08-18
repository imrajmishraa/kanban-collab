export type WorkspaceStatus = "active" | "deletion_pending";

export type WorkspaceMemberRole = "owner" | "admin" | "member" | "guest";

export interface WorkspaceMember {
  userId: string;
  role: WorkspaceMemberRole;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;

  ownerId: string;

  members: WorkspaceMember[];

  status: WorkspaceStatus;

  deletionRequestedAt: string | null;
  deletionScheduledFor: string | null;

  createdAt: string;
  updatedAt: string;
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
  role?: WorkspaceMemberRole;
}

export interface WorkspaceDeletionResponse {
  workspaceId: string;
  status: WorkspaceStatus;
  deletionRequestedAt: string;
  deletionScheduledFor: string;
}
