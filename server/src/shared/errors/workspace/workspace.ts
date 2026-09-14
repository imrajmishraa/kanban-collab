// server/src/shared/errors/workspace/workspace.ts
import { HTTP_STATUS } from "../../constants/http";
import { ERROR_MESSAGE } from "../../constants/error";
import { ApiError } from "../../utils/ApiError";

// ============================================================================
// CREATION
// ============================================================================

export function createWorkspaceError(): ApiError {
  return new ApiError(
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    ERROR_MESSAGE.CREATE_WORKSPACE_FAILED,
    { code: "CREATE_WORKSPACE_FAILED", isOperational: false },
  );
}

// ============================================================================
// NOT FOUND
// ============================================================================

export function workspaceNotFoundError(): ApiError {
  return new ApiError(
    HTTP_STATUS.NOT_FOUND,
    ERROR_MESSAGE.WORKSPACE_NOT_FOUND,
    { code: "WORKSPACE_NOT_FOUND" },
  );
}

// ============================================================================
// AUTHORIZATION
// ============================================================================

export function forbiddenWorkspaceError(): ApiError {
  return new ApiError(
    HTTP_STATUS.FORBIDDEN,
    ERROR_MESSAGE.WORKSPACE_ACCESS_DENIED,
    { code: "WORKSPACE_ACCESS_DENIED" },
  );
}

export function adminAccessRequiredError(): ApiError {
  return new ApiError(
    HTTP_STATUS.FORBIDDEN,
    ERROR_MESSAGE.ADMIN_ACCESS_REQUIRED,
    { code: "ADMIN_ACCESS_REQUIRED" },
  );
}

export function adminOrOwnerAccessRequiredError(): ApiError {
  return new ApiError(
    HTTP_STATUS.FORBIDDEN,
    ERROR_MESSAGE.ADMIN_OR_OWNER_ACCESS_REQUIRED,
    { code: "ADMIN_OR_OWNER_ACCESS_REQUIRED" },
  );
}

export function workspaceMemberRequiredError(): ApiError {
  return new ApiError(
    HTTP_STATUS.FORBIDDEN,
    ERROR_MESSAGE.WORKSPACE_MEMBER_REQUIRED,
    { code: "WORKSPACE_MEMBER_REQUIRED" },
  );
}

// ============================================================================
// MEMBERSHIP
// ============================================================================

export function userAlreadyWorkspaceMemberError(): ApiError {
  return new ApiError(
    HTTP_STATUS.CONFLICT,
    ERROR_MESSAGE.USER_ALREADY_WORKSPACE_MEMBER,
    { code: "USER_ALREADY_WORKSPACE_MEMBER" },
  );
}

// ============================================================================
// LIFECYCLE / DELETION
// ============================================================================

export function workspaceDeletionAlreadyStartedError(): ApiError {
  return new ApiError(
    HTTP_STATUS.CONFLICT,
    ERROR_MESSAGE.WORKSPACE_DELETION_ALREADY_STARTED,
    { code: "WORKSPACE_DELETION_ALREADY_STARTED" },
  );
}

export function workspaceDeletionFailedError(): ApiError {
  return new ApiError(
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    ERROR_MESSAGE.WORKSPACE_DELETION_FAILED,
    { code: "WORKSPACE_DELETION_FAILED", isOperational: false },
  );
}

// ============================================================================
// VALIDATION
// ============================================================================

export function workspaceIdRequiredError(): ApiError {
  return new ApiError(
    HTTP_STATUS.BAD_REQUEST,
    ERROR_MESSAGE.WORKSPACE_ID_REQUIRED,
    { code: "WORKSPACE_ID_REQUIRED" },
  );
}

// ============================================================================
// DEPRECATED ALIASES — kept so existing controller imports don't break
// Migrate call sites to the canonical names above, then delete this block.
// ============================================================================

/** @deprecated Use `workspaceDeletionAlreadyStartedError` instead. */
export const workspaceAlreadyPendingDeletionError =
  workspaceDeletionAlreadyStartedError;

/** @deprecated Use `adminOrOwnerAccessRequiredError` instead. */
export const cannotModifyWorkspaceError = adminOrOwnerAccessRequiredError;

/** @deprecated Use `adminOrOwnerAccessRequiredError` instead. */
export const cannotDeleteWorkspaceError = adminOrOwnerAccessRequiredError;

/** @deprecated Use `workspaceMemberRequiredError` instead. */
export const notWorkspaceMemberError = workspaceMemberRequiredError;

// Re-export from auth errors — several controllers historically imported
// `userNotFoundError` from this file. It lives in auth/custom now.
/** @deprecated Import from `shared/errors/auth/custom` directly. */
export { userNotFoundError } from "../auth/custom";
