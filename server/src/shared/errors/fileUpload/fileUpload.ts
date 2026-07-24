import { ApiError } from "../../utils/ApiError";

export const forbiddenWorkspaceError = () => new ApiError(403, "Forbidden: workspace");

export const attachmentsRequiredError = () =>
  new ApiError(400, "fileName, fileType, and cardId are required");

export const guestCanNotUploadError = () =>
  new ApiError(403, "Forbidden: Guests cannot upload attachments");