import { ApiError } from "../../utils/ApiError";

export const guestNotCreateBoards = () =>
  new ApiError(401, "Forbidden: Guests cannot make changes");


export const boardNotFoundError = () => 
    new ApiError(404, 'Board not found');

export const boardWorkspaceAccessDeniedError = () => new ApiError(401, "Forbidden: Board workspace access denied");

export const boardIdAndQueryParametersRequiredError = () =>
  new ApiError(400, "boardId and query parameters are required");