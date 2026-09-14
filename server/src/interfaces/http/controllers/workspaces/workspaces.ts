// server/src/interfaces/http/controllers/workspaces/workspaces.ts
import { Types } from "mongoose";

import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import { ApiResponse } from "../../../../shared/utils/ApiResponse";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";

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
  const userId = req.user!.userId;

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
  const userId = req.user!.userId;
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
  const userId = req.user!.userId;

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
  const userId = req.user!.userId;

  const userObjectId = new Types.ObjectId(userId);

  const currentPage = Math.max(Number(page) || 1, 1);
  const pageLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
  const skip = (currentPage - 1) * pageLimit;

  const workspaceFilter: Record<string, unknown> = {
    "members.userId": userObjectId,
  };

  const trimmedSearch = typeof search === "string" ? search.trim() : "";

  if (trimmedSearch) {
    workspaceFilter.name = { $regex: trimmedSearch, $options: "i" };
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
    const userId = req.user!.userId;

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

// EXPORTS

export {
  createWorkspace,
  listWorkspaces,
  addWorkspaceMember,
  updateWorkspace,
  deleteWorkspace,
};
