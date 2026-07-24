import { ApiError } from "../../utils/ApiError";

export const createWorkspaceError = () =>
  new ApiError(500, "Failed to create workspace");

export const verifyAdminError = () => 
    new ApiError(401, "Forbidden: Admin access required");

export const workspaceIdRequiredError = () =>
  new ApiError(401, "Workspace ID required");


export const userEmailNotExistError = () => 
    new ApiError(401, "User email not found");


export const userAlreadyMemberError = ()  => 
    new ApiError(401, "User is already a member of this workspace");


export const notWorkspaceMemberError = () =>
  new ApiError(401, "Forbidden: Not a workspace member");



