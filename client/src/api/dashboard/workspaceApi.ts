import { apiClient } from "../client";

import type { ApiResponse } from "@/types/api/api";
import type {
  AddWorkspaceMemberPayload,
  CreateWorkspacePayload,
  UpdateWorkspacePayload,
  Workspace,
  WorkspaceDeletionResponse,
  WorkspacePagination,
  ListWorkspacesParams,
} from "@/types/api/dashboard/workspace";

interface WorkspaceApiDocument extends Omit<Workspace, "id"> {
  _id: string;
}

interface ListWorkspacesResponse {
  workspaces: WorkspaceApiDocument[];
  pagination: WorkspacePagination;
}

const normalize = (doc: WorkspaceApiDocument): Workspace => ({
  ...doc,
  id: doc._id,
});

export const workspaceApi = {
  async listWorkspaces(
    params: ListWorkspacesParams = {},
  ): Promise<{ workspaces: Workspace[]; pagination: WorkspacePagination }> {
    const response = await apiClient.get<ApiResponse<ListWorkspacesResponse>>(
      "/workspaces",
      { params },
    );

    return {
      workspaces: response.data.data.workspaces.map(normalize),
      pagination: response.data.data.pagination,
    };
  },

  async createWorkspace(payload: CreateWorkspacePayload): Promise<Workspace> {
    const response = await apiClient.post<ApiResponse<WorkspaceApiDocument>>(
      "/workspaces",
      payload,
    );

    return normalize(response.data.data);
  },

  async updateWorkspace(
    workspaceId: string,
    payload: UpdateWorkspacePayload,
  ): Promise<Workspace> {
    const response = await apiClient.patch<ApiResponse<WorkspaceApiDocument>>(
      `/workspaces/${workspaceId}`,
      payload,
    );

    return normalize(response.data.data);
  },

  async deleteWorkspace(
    workspaceId: string,
  ): Promise<WorkspaceDeletionResponse> {
    const response = await apiClient.delete<
      ApiResponse<WorkspaceDeletionResponse>
    >(`/workspaces/${workspaceId}`);

    return response.data.data;
  },

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