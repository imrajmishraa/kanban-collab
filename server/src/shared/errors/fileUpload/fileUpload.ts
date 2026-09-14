import { HTTP_STATUS } from "../../constants/http";
import { ERROR_MESSAGE } from "../../constants/error";
import { ApiError } from "../../utils/ApiError";

/**
 * 400 — an attachment upload was missing one of the required fields
 * (`fileName`, `fileType`, or `cardId`).
 */
export function attachmentsRequiredError(): ApiError {
  return new ApiError(
    HTTP_STATUS.BAD_REQUEST,
    ERROR_MESSAGE.ATTACHMENT_FIELDS_REQUIRED,
    {
      code: "ATTACHMENT_FIELDS_REQUIRED",
      errors: [
        {
          field: "attachment",
          message: "fileName, fileType, and cardId are required.",
          code: "ATTACHMENT_FIELDS_REQUIRED",
        },
      ],
    },
  );
}

/**
 * 403 — a guest attempted to upload an attachment.
 * Guests have read-only access; uploads require member+ role.
 */
export function guestCannotUploadError(): ApiError {
  return new ApiError(
    HTTP_STATUS.FORBIDDEN,
    ERROR_MESSAGE.GUEST_CANNOT_UPLOAD_ATTACHMENT,
    { code: "GUEST_CANNOT_UPLOAD_ATTACHMENT" },
  );
}

/**
 * 404 — the attachment ID doesn't resolve to any document.
 */
export function attachmentNotFoundError(): ApiError {
  return new ApiError(
    HTTP_STATUS.NOT_FOUND,
    ERROR_MESSAGE.ATTACHMENT_NOT_FOUND,
    { code: "ATTACHMENT_NOT_FOUND" },
  );
}

/**
 * 403 — user doesn't have access to this attachment.
 */
export function attachmentAccessDeniedError(): ApiError {
  return new ApiError(
    HTTP_STATUS.FORBIDDEN,
    ERROR_MESSAGE.ATTACHMENT_ACCESS_DENIED,
    { code: "ATTACHMENT_ACCESS_DENIED" },
  );
}
