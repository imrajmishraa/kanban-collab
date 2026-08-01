import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { Types } from "mongoose";
import { WorkspaceModel } from "../../../../infrastructure/db/mongoose/schemas";
import { workspaceControllerLogger } from "../../../../infrastructure/logging/childLogger";
import { ApiResponse } from "../../../../shared/utils/ApiResponse";
import { userAlreadyWorkspaceMemberError, userNotFoundError, adminAccessRequiredError } from "../../../../shared/errors/workspace/workspace";

const createWorkspace = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const { name, description } = req.body;
    const userId = req.user!.userId;
    try {

      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const uniqueSlug = `${slug}-${Date.now().toString().slice(-4)}`;

      const workspace = await WorkspaceModel.create({
        name,
        slug: uniqueSlug,
        description,
        ownerId: new Types.ObjectId(userId),
        members: [{ userId: new Types.ObjectId(userId), role: "admin" }],
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

    // Verify active user is admin in this workspace
    const workspace = await WorkspaceModel.findOne({
      _id: id,
      members: {
        $elemMatch: { userId: new Types.ObjectId(userId), role: "admin" },
      },
    });


    if (!workspace) {
      throw adminAccessRequiredError();
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


export { createWorkspace, listWorkspaces, addWorkspaceMember };
