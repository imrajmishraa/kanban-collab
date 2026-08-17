import { apiClient } from "../client";

import type { ApiResponse } from "@/types/api/api";
import type {
  AddWorkspaceMemberPayload,
  CreateWorkspacePayload,
  UpdateWorkspacePayload,
  Workspace,
  WorkspaceDeletionResponse,
} from "@/types/api/dashboard/workspace";

interface WorkspaceApiDocument extends Omit<Workspace, "id"> {
  _id: string;
}

interface WorkspaceListResponse {
  data: WorkspaceApiDocument[];
}

interface WorkspaceResponse {
  data: WorkspaceApiDocument;
}

const normalizeWorkspace = (workspace: WorkspaceApiDocument): Workspace => {
  return {
    ...workspace,
    id: workspace._id,
  };
};

export const workspaceApi = {
  /**
   * Fetch all workspaces where the authenticated
   * user is a member.
   */
  async listWorkspaces(): Promise<Workspace[]> {
    const response =
      await apiClient.get<ApiResponse<WorkspaceListResponse>>("/workspaces");

    return response.data.data.data.map(normalizeWorkspace);
  },

  /**
   * Create a new workspace.
   */
  async createWorkspace(payload: CreateWorkspacePayload): Promise<Workspace> {
    const response = await apiClient.post<ApiResponse<WorkspaceResponse>>(
      "/workspaces",
      payload,
    );

    return normalizeWorkspace(response.data.data.data);
  },

  /**
   * Update an existing workspace.
   */
  async updateWorkspace(
    workspaceId: string,
    payload: UpdateWorkspacePayload,
  ): Promise<Workspace> {
    const response = await apiClient.patch<ApiResponse<WorkspaceResponse>>(
      `/workspaces/${workspaceId}`,
      payload,
    );

    return normalizeWorkspace(response.data.data.data);
  },

  /**
   * Schedule a workspace for deletion.
   */
  async deleteWorkspace(
    workspaceId: string,
  ): Promise<WorkspaceDeletionResponse> {
    const response = await apiClient.delete<
      ApiResponse<WorkspaceDeletionResponse>
    >(`/workspaces/${workspaceId}`);

    return response.data.data;
  },

  /**
   * Add a member to a workspace.
   */
  async addWorkspaceMember(
    workspaceId: string,
    payload: AddWorkspaceMemberPayload,
  ): Promise<null> {
    const response = await apiClient.post<ApiResponse<null>>(
      `/workspaces/${workspaceId}/members`,
      payload,
    );

    return response.data.data;
  },
};
