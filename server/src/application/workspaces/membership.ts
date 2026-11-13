/**
 * One place to answer "may this user write here?".
 *
 * The membership check was copy-pasted into fourteen controllers, which is why
 * the workspace lifecycle could not be enforced in one spot: when a workspace
 * was scheduled for deletion, every one of those copies still said "yes".
 *
 * `loadActiveMembership` does the two checks that every write path needs and
 * nothing else:
 *
 *   1. the caller is a member of the workspace (else the caller's own error)
 *   2. the workspace is not scheduled for deletion (else 409)
 *
 * It deliberately does NOT enforce roles — `guest` handling differs per surface
 * (boards refuse with `guestCannotModifyBoardError`, comments allow guests to
 * read but not vote), so the caller keeps its own role rule using the returned
 * `member`.
 */

import { Types } from "mongoose";

import { WorkspaceModel } from "../../infrastructure/db/mongoose/schemas";
import type { WorkspaceRole } from "../../infrastructure/db/mongoose/schemas";

import { guestCannotModifyBoardError } from "../../shared/errors/board/board";
import {
  notWorkspaceMemberError,
  workspacePendingDeletionError,
} from "../../shared/errors/workspace/workspace";
import type { ApiError } from "../../shared/utils/ApiError";

import {
  isWorkspaceWritable,
  type WorkspaceStatus,
} from "./workspaceLifecycle";

export interface MembershipMember {
  userId: Types.ObjectId;
  role: WorkspaceRole;
}

export interface MembershipWorkspace {
  _id: Types.ObjectId;
  status: WorkspaceStatus;
  members: MembershipMember[];
}

export interface ActiveMembership {
  workspace: MembershipWorkspace;
  member: MembershipMember;
}

export interface LoadMembershipOptions {
  /**
   * Projection for the workspace query. Defaults to `members status`, which is
   * everything this helper needs; callers that read more pass their own.
   */
  select?: string;
  /**
   * Error to throw when the caller is not a member. Surfaces disagreed on this
   * (`BOARD_ACCESS_DENIED` vs `WORKSPACE_MEMBER_REQUIRED`), so the caller keeps
   * the choice instead of every route silently changing its error code.
   */
  onMissing?: () => ApiError;
}

/**
 * Load the caller's membership of a workspace, refusing read-only workspaces.
 *
 * Throws `onMissing()` (default `WORKSPACE_MEMBER_REQUIRED`) when the workspace
 * does not exist or the caller is not in it — the two cases are deliberately
 * indistinguishable, so the endpoint cannot be used to probe for workspace ids.
 */
export async function loadActiveMembership(
  workspaceId: Types.ObjectId | string,
  userId: string,
  options: LoadMembershipOptions = {},
): Promise<ActiveMembership> {
  const { select = "members status", onMissing = notWorkspaceMemberError } =
    options;

  const workspace = (await WorkspaceModel.findOne({
    _id: workspaceId,
    "members.userId": new Types.ObjectId(userId),
  })
    .select(select)
    .lean()) as MembershipWorkspace | null;

  if (!workspace) {
    throw onMissing();
  }

  const member = workspace.members.find(
    (candidate) => candidate.userId.toString() === userId,
  );

  if (!member) {
    throw onMissing();
  }

  /* Read-only from here on: the purge job will delete this workspace and
     everything under it, so accepting the write would only lose the data. */
  if (!isWorkspaceWritable(workspace.status)) {
    throw workspacePendingDeletionError();
  }

  return { workspace, member };
}

/**
 * `loadActiveMembership` plus "guests may not write here".
 *
 * The board, column and card surfaces all refuse guests with the same error, so
 * they share this wrapper; anything with a different role rule calls
 * `loadActiveMembership` directly.
 */
export async function loadWriterMembership(
  workspaceId: Types.ObjectId | string,
  userId: string,
  options: LoadMembershipOptions = {},
): Promise<ActiveMembership> {
  const membership = await loadActiveMembership(workspaceId, userId, options);

  if (membership.member.role === "guest") {
    throw guestCannotModifyBoardError();
  }

  return membership;
}
