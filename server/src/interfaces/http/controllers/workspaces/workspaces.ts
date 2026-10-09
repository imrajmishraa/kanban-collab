import { Types } from "mongoose";

import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import { ApiResponse } from "../../../../shared/utils/ApiResponse";
import { ApiError } from "../../../../shared/utils/ApiError";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware";

/** Guard instead of `req.user!` — see the dashboard controller for rationale. */
function requireUserId(req: AuthenticatedRequest): string {
  if (!req.user) {
    throw ApiError.unauthorized("Authentication required.");
  }
  return req.user.userId;
}

import {
  UserModel,
  WorkspaceModel,
} from "../../../../infrastructure/db/mongoose/schemas";
import { workspaceControllerLogger } from "../../../../infrastructure/logging/childLogger";

import {
  userAlreadyWorkspaceMemberError,
  notWorkspaceMemberError,
  cannotModifyWorkspaceError,
  cannotDeleteWorkspaceError,
  workspaceAlreadyPendingDeletionError,
  workspaceDeletionFailedError,
  workspaceNotFoundError,
} from "../../../../shared/errors/workspace/workspace";

import { userNotFoundError } from "../../../../shared/errors/auth/custom";
import { invalidObjectIdError } from "../../../../shared/errors/handler/generic";

import { WORKSPACE_DELETION_GRACE_PERIOD_DAYS } from "../../../../shared/constants/workspace";

// CREATE

const createWorkspace = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { name, description, slug } = req.body;
  const userId = requireUserId(req);

  const userObjectId = new Types.ObjectId(userId);

  const workspace = await WorkspaceModel.create({
    name,
    slug,
    description,
    ownerId: userObjectId,
    members: [{ userId: userObjectId, role: "owner" }],
  });

  workspaceControllerLogger.info(
    { workspaceId: workspace._id.toString(), userId },
    "Workspace created",
  );

  return res
    .status(201)
    .json(new ApiResponse(201, "Workspace created successfully.", workspace));
});

// UPDATE

const updateWorkspace = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { name, slug, description } = req.body;
  const userId = requireUserId(req);
  const { workspaceId } = req.params;

  if (!workspaceId || !Types.ObjectId.isValid(workspaceId)) {
    throw invalidObjectIdError();
  }

  const userObjectId = new Types.ObjectId(userId);

  const workspace = await WorkspaceModel.findOne({
    _id: workspaceId,
    "members.userId": userObjectId,
  });

  if (!workspace) {
    throw notWorkspaceMemberError();
  }

  const member = workspace.members.find((item) =>
    item.userId.equals(userObjectId),
  );

  if (!member || !["owner", "admin"].includes(member.role)) {
    throw cannotModifyWorkspaceError();
  }

  const updateData: {
    name?: string;
    slug?: string;
    description?: string;
  } = {};

  if (name !== undefined) updateData.name = name;
  if (slug !== undefined) updateData.slug = slug;
  if (description !== undefined) updateData.description = description;

  workspace.set(updateData);
  await workspace.save();

  workspaceControllerLogger.info(
    {
      workspaceId: workspace._id.toString(),
      userId,
      updatedFields: Object.keys(updateData),
    },
    "Workspace updated",
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Workspace updated successfully.", workspace));
});

// DELETE

const deleteWorkspace = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { workspaceId } = req.params;
  const userId = requireUserId(req);

  if (!workspaceId || !Types.ObjectId.isValid(workspaceId)) {
    throw invalidObjectIdError();
  }

  const userObjectId = new Types.ObjectId(userId);

  const now = new Date();
  const deletionScheduledFor = new Date(now);
  deletionScheduledFor.setDate(
    deletionScheduledFor.getDate() + WORKSPACE_DELETION_GRACE_PERIOD_DAYS,
  );

  const workspace = await WorkspaceModel.findOneAndUpdate(
    {
      _id: workspaceId,
      ownerId: userObjectId,
      status: "active",
    },
    {
      $set: {
        status: "deletion_pending",
        deletionRequestedAt: now,
        deletionScheduledFor,
      },
    },
    { new: true },
  );

  if (!workspace) {
    const existing = await WorkspaceModel.findById(workspaceId);

    if (!existing) {
      throw workspaceNotFoundError();
    }
    if (!existing.ownerId.equals(userObjectId)) {
      throw cannotDeleteWorkspaceError();
    }
    if (existing.status === "deletion_pending") {
      throw workspaceAlreadyPendingDeletionError();
    }

    throw workspaceDeletionFailedError();
  }

  workspaceControllerLogger.info(
    {
      workspaceId: workspace._id.toString(),
      userId,
      deletionRequestedAt: workspace.deletionRequestedAt,
      deletionScheduledFor: workspace.deletionScheduledFor,
    },
    "Workspace scheduled for deletion",
  );

  return res.status(202).json(
    new ApiResponse(202, "Workspace scheduled for deletion.", {
      workspaceId: workspace._id,
      status: workspace.status,
      deletionRequestedAt: workspace.deletionRequestedAt,
      deletionScheduledFor: workspace.deletionScheduledFor,
    }),
  );
});

// LIST

const listWorkspaces = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { search, page = "1", limit = "10" } = req.query;
  const userId = requireUserId(req);

  const userObjectId = new Types.ObjectId(userId);

  const currentPage = Math.max(Number(page) || 1, 1);
  const pageLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
  const skip = (currentPage - 1) * pageLimit;

  const workspaceFilter: Record<string, unknown> = {
    "members.userId": userObjectId,
  };

  const trimmedSearch = typeof search === "string" ? search.trim() : "";

  if (trimmedSearch) {
    workspaceFilter["name"] = { $regex: trimmedSearch, $options: "i" };
  }

  const [workspaces, totalWorkspaces] = await Promise.all([
    WorkspaceModel.find(workspaceFilter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(pageLimit)
      .lean(),

    WorkspaceModel.countDocuments(workspaceFilter),
  ]);

  const totalPages = Math.ceil(totalWorkspaces / pageLimit);

  workspaceControllerLogger.info(
    {
      userId,
      workspaceCount: workspaces.length,
      search: trimmedSearch || undefined,
      page: currentPage,
      limit: pageLimit,
      totalWorkspaces,
    },
    "Workspaces retrieved",
  );

  return res.status(200).json(
    new ApiResponse(200, "Workspaces fetched successfully.", {
      workspaces,
      pagination: {
        page: currentPage,
        limit: pageLimit,
        totalWorkspaces,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    }),
  );
});

// ADD MEMBER

const addWorkspaceMember = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const { workspaceId } = req.params;
    const { email, role } = req.body;
    const userId = requireUserId(req);

    if (!workspaceId || !Types.ObjectId.isValid(workspaceId)) {
      throw invalidObjectIdError();
    }

    const userObjectId = new Types.ObjectId(userId);

    const workspace = await WorkspaceModel.findOne({
      _id: workspaceId,
      members: {
        $elemMatch: {
          userId: userObjectId,
          role: { $in: ["owner", "admin"] },
        },
      },
    });

    if (!workspace) {
      throw cannotModifyWorkspaceError();
    }

    const userToAdd = await UserModel.findOne({
      email: email.toLowerCase().trim(),
    })
      .select("_id email fullName")
      .lean();

    if (!userToAdd) {
      throw userNotFoundError();
    }

    const isMember = workspace.members.some((m) =>
      m.userId.equals(userToAdd._id),
    );

    if (isMember) {
      throw userAlreadyWorkspaceMemberError();
    }

    // Only an owner may grant ownership (mirrors updateWorkspaceMemberRole).
    const caller = workspace.members.find(
      (m) => m.userId.toString() === userId,
    );

    if (role === "owner" && caller?.role !== "owner") {
      throw cannotModifyWorkspaceError();
    }

    workspace.members.push({
      userId: userToAdd._id,
      role: role ?? "member",
    });
    await workspace.save();

    workspaceControllerLogger.info(
      {
        workspaceId: workspace._id.toString(),
        userId,
        newUserId: userToAdd._id.toString(),
        role: role ?? "member",
      },
      "Member added to workspace",
    );

    return res
      .status(200)
      .json(new ApiResponse(200, "Member added successfully.", null));
  },
);

// LIST MEMBERS

const listWorkspaceMembers = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const { workspaceId } = req.params;
    const userId = requireUserId(req);

    if (!workspaceId || !Types.ObjectId.isValid(workspaceId)) {
      throw invalidObjectIdError();
    }

    const userObjectId = new Types.ObjectId(userId);

    // Any member of the workspace may read its member list.
    const workspace = await WorkspaceModel.findOne({
      _id: workspaceId,
      "members.userId": userObjectId,
    })
      .select("members")
      .lean();

    if (!workspace) {
      throw notWorkspaceMemberError();
    }

    const memberIds = workspace.members.map((m) => m.userId);

    const users = await UserModel.find({ _id: { $in: memberIds } })
      .select("_id fullName email")
      .lean();

    const usersById = new Map(users.map((u) => [u._id.toString(), u]));

    const members = workspace.members.map((m) => {
      const user = usersById.get(m.userId.toString());
      return {
        userId: m.userId.toString(),
        role: m.role,
        name: user?.fullName ?? null,
        email: user?.email ?? null,
      };
    });

    workspaceControllerLogger.info(
      { workspaceId, userId, memberCount: members.length },
      "Workspace members listed",
    );

    return res
      .status(200)
      .json(new ApiResponse(200, "Members fetched successfully", { members }));
  },
);

// MEMBER MANAGEMENT (T13)

type WorkspaceRoleValue = "owner" | "admin" | "member" | "guest";

/**
 * Load a workspace where the caller holds one of `roles`.
 *
 * Returns the mutable document — callers mutate `members` and `save()`.
 */
async function requireWorkspaceRole(
  workspaceId: string,
  userId: string,
  roles: readonly WorkspaceRoleValue[],
) {
  if (!Types.ObjectId.isValid(workspaceId)) {
    throw invalidObjectIdError();
  }

  const workspace = await WorkspaceModel.findOne({
    _id: workspaceId,
    members: {
      $elemMatch: {
        userId: new Types.ObjectId(userId),
        role: { $in: roles },
      },
    },
  });

  if (!workspace) {
    throw cannotModifyWorkspaceError();
  }

  return workspace;
}

function ownerCount(workspace: { members: Array<{ role: string }> }): number {
  return workspace.members.filter((m) => m.role === "owner").length;
}

/** PATCH /api/v1/workspaces/:workspaceId/members/:memberId */
const updateWorkspaceMemberRole = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const { workspaceId, memberId } = req.params as {
      workspaceId: string;
      memberId: string;
    };
    const { role } = (req.validated?.body ?? req.body) as {
      role: WorkspaceRoleValue;
    };
    const userId = requireUserId(req);

    const workspace = await requireWorkspaceRole(workspaceId, userId, [
      "owner",
      "admin",
    ]);

    const target = workspace.members.find(
      (m) => m.userId.toString() === memberId,
    );

    if (!target) {
      throw notWorkspaceMemberError();
    }

    const caller = workspace.members.find(
      (m) => m.userId.toString() === userId,
    );

    // Only an owner may grant or revoke ownership.
    if (
      (role === "owner" || target.role === "owner") &&
      caller?.role !== "owner"
    ) {
      throw cannotModifyWorkspaceError();
    }

    // Never leave the workspace without an owner.
    if (
      target.role === "owner" &&
      role !== "owner" &&
      ownerCount(workspace) <= 1
    ) {
      throw cannotModifyWorkspaceError();
    }

    target.role = role;
    await workspace.save();

    workspaceControllerLogger.info(
      { workspaceId, userId, memberId, role },
      "Workspace member role updated",
    );

    return res.status(200).json(
      new ApiResponse(200, "Member role updated successfully", {
        member: { userId: memberId, role },
      }),
    );
  },
);

/** DELETE /api/v1/workspaces/:workspaceId/members/:memberId */
const removeWorkspaceMember = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const { workspaceId, memberId } = req.params as {
      workspaceId: string;
      memberId: string;
    };
    const userId = requireUserId(req);

    const workspace = await requireWorkspaceRole(workspaceId, userId, [
      "owner",
      "admin",
    ]);

    const target = workspace.members.find(
      (m) => m.userId.toString() === memberId,
    );

    if (!target) {
      throw notWorkspaceMemberError();
    }

    const caller = workspace.members.find(
      (m) => m.userId.toString() === userId,
    );

    if (target.role === "owner") {
      if (caller?.role !== "owner" || ownerCount(workspace) <= 1) {
        throw cannotModifyWorkspaceError();
      }
    }

    workspace.members = workspace.members.filter(
      (m) => m.userId.toString() !== memberId,
    );
    await workspace.save();

    workspaceControllerLogger.info(
      { workspaceId, userId, memberId },
      "Workspace member removed",
    );

    return res.status(200).json(
      new ApiResponse(200, "Member removed successfully", {
        member: { userId: memberId },
      }),
    );
  },
);

/** POST /api/v1/workspaces/:workspaceId/leave */
const leaveWorkspace = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { workspaceId } = req.params as { workspaceId: string };
  const userId = requireUserId(req);

  if (!Types.ObjectId.isValid(workspaceId)) {
    throw invalidObjectIdError();
  }

  const workspace = await WorkspaceModel.findById(workspaceId);

  if (!workspace) {
    throw workspaceNotFoundError();
  }

  const member = workspace.members.find((m) => m.userId.toString() === userId);

  if (!member) {
    throw notWorkspaceMemberError();
  }

  // The last owner cannot leave — someone has to own the workspace.
  if (member.role === "owner" && ownerCount(workspace) <= 1) {
    throw cannotModifyWorkspaceError();
  }

  workspace.members = workspace.members.filter(
    (m) => m.userId.toString() !== userId,
  );
  await workspace.save();

  workspaceControllerLogger.info(
    { workspaceId, userId },
    "Member left workspace",
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "You have left the workspace", null));
});

// EXPORTS

export {
  createWorkspace,
  listWorkspaces,
  addWorkspaceMember,
  listWorkspaceMembers,
  updateWorkspace,
  deleteWorkspace,
  updateWorkspaceMemberRole,
  removeWorkspaceMember,
  leaveWorkspace,
};
