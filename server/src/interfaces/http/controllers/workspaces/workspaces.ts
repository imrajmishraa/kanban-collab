import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { Types } from "mongoose";
import { WorkspaceModel } from "../../../../infrastructure/db/mongoose/schemas";
import { workspaceControllerLogger } from "../../../../infrastructure/logging/childLogger";
import { ApiResponse } from "../../../../shared/utils/ApiResponse";
import { userAlreadyWorkspaceMemberError, userNotFoundError, notWorkspaceMemberError, cannotModifyWorkspaceError, cannotDeleteWorkspaceError, workspaceAlreadyPendingDeletionError, workspaceDeletionFailedError, workspaceNotFoundError } from "../../../../shared/errors/workspace/workspace";
import { WORKSPACE_DELETION_GRACE_PERIOD_DAYS } from "../../../../shared/constants/workspace";

const createWorkspace = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const { name, description, slug } = req.body;
    const userId = req.user!.userId;
    try {
      const workspace = await WorkspaceModel.create({
        name,
        slug: slug,
        description,
        ownerId: new Types.ObjectId(userId),
        members: [{ userId: new Types.ObjectId(userId), role: "owner" }],
      });

      workspaceControllerLogger.info(
        { workspaceId: workspace._id, userId },
        "Workspace created",
      );

       return res.status(201).json(
        new ApiResponse(201, 'Workspace created successfully', {
            data: workspace
        })
       );
    } catch (error) {
      workspaceControllerLogger.error(
        {
          err: error,
          userId,
        },
        "Failed to create workspace",
      );
      throw error;
    }
  },
);

const updateWorkspace = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { name, slug, description } = req.body;
  const userId = req.user!.userId;
  const { workspaceId } = req.params;

  try {
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

    if (name !== undefined) {
      updateData.name = name;
    }

    if (slug !== undefined) {
      updateData.slug = slug;
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    workspace.set(updateData);

    await workspace.save();

    workspaceControllerLogger.info(
      {
        workspaceId: workspace._id,
        userId,
        updatedFields: Object.keys(updateData),
      },
      "Workspace updated",
    );

    res.status(200).json(
      new ApiResponse(200, "Workspace updated successfully.", {
        data: workspace,
      }),
    );
  } catch (error) {
    workspaceControllerLogger.error(
      {
        err: error,
        userId,
        workspaceId,
      },
      "Failed to update workspace",
    );

    throw error;
  }
});


const deleteWorkspace = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { workspaceId } = req.params;
  const userId = req.user!.userId;

  try {
    if (!workspaceId || !Types.ObjectId.isValid(workspaceId)) {
      throw workspaceNotFoundError();
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
      {
        new: true,
      },
    );

    if (!workspace) {
      const existingWorkspace = await WorkspaceModel.findById(workspaceId);

      if (!existingWorkspace) {
        throw workspaceNotFoundError();
      }

      if (existingWorkspace.ownerId.toString() !== userId) {
        throw cannotDeleteWorkspaceError();
      }

      if (existingWorkspace.status === "deletion_pending") {
        throw workspaceAlreadyPendingDeletionError();
      }

      throw workspaceDeletionFailedError();
    }

    workspaceControllerLogger.info(
      {
        workspaceId: workspace._id,
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
  } catch (error) {
    workspaceControllerLogger.error(
      {
        err: error,
        workspaceId,
        userId,
      },
      "Failed to schedule workspace deletion",
    );

    throw error;
  }
});

const listWorkspaces = asyncHandler(async (req: AuthenticatedRequest, res) => {
        const userId = req.user!.userId;  
  try {
        const workspaces = await WorkspaceModel.find({
          "members.userId": new Types.ObjectId(userId),
        });

        workspaceControllerLogger.info(
          {
            userId,
            workspaceCount: workspaces.length,
          },
          "Workspaces retrieved",
        );
        return res.status(200).json(
          new ApiResponse(200, "Workspaces fetched successfully", {
            data: workspaces,
          }),
        );
    } catch (error) {
      workspaceControllerLogger.error(
        { err: error },
        "Failed to list workspaces",
      );
        throw error;
    }
});

const addWorkspaceMember = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { email, role } = req.body;
  const userId = req.user!.userId;
  try {

    // Verify active user is owner/admin in this workspace
    const workspace = await WorkspaceModel.findOne({
      _id: id,
      members: {
        $elemMatch: {
          userId: new Types.ObjectId(userId),
          role: { $in: ["owner", "admin"] },
        },
      },
    });


    if (!workspace) {
      throw cannotModifyWorkspaceError();
    }

    // Add member directly for this setup
    const userToAdd = await WorkspaceModel.db.model("User").findOne({ email });
    if (!userToAdd) {
      throw userNotFoundError();
    }

    // Check if already a member
    const isMember = workspace.members.some((m) =>
      m.userId.equals(userToAdd._id),
    );

    if (isMember) {
      throw userAlreadyWorkspaceMemberError();
    }

    workspace.members.push({ userId: userToAdd._id, role: role || "member" });
    await workspace.save();

   workspaceControllerLogger.info(
     {
       workspaceId: id,
       userId, // the authenticated user performing the action
       newUserId: userToAdd._id, // the member being added
     },
     "Member added to workspace",
   );

    return res.status(200).json(
      new ApiResponse(200, "Member added successfuly", {
        data: null,
      }),
    );
  } catch (error) {
    workspaceControllerLogger.error(
      {
        err: error,
        workspaceId: id,
        userId,
      },
      "Failed to add workspace member",
    );
    throw error;
  }
});


export {
  createWorkspace,
  listWorkspaces,
  addWorkspaceMember,
  updateWorkspace,
  deleteWorkspace,
};
