import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { Types } from "mongoose";
import { WorkspaceModel } from "../../../../infrastructure/db/mongoose/schemas";
import { logger } from "../../../../infrastructure/logging/logger";
import { ApiResponse } from "../../../../shared/utils/ApiResponse";
import { internalServerError } from "../../../../shared/errors/handler/custom";
import { userAlreadyMemberError, userEmailNotExistError, verifyAdminError } from "../../../../shared/errors/workspace/workspace";

const createWorkspace = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    try {
      const { name, description } = req.body;
      const userId = req.user!.userId;

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

      logger.info({ workspaceId: workspace._id, userId }, "Workspace created");

       return res.status(201).json(
        new ApiResponse(201, 'Workspace created successfully', {
            data: workspace 
        })
       );
    } catch (error) {
      logger.error({ err: error }, "Failed to create workspace");
      throw internalServerError();
    }
  },
);

const listWorkspaces = asyncHandler(async (req: AuthenticatedRequest, res) => {
    try {
        const userId = req.user!.userId;
        const workspaces = await WorkspaceModel.find({
          "members.userId": new Types.ObjectId(userId),
        });
        
        return res.status(200).json(
          new ApiResponse(200, "Workspaces fetched successfully", {
            data: workspaces,
          }),
        );
    } catch (error) {
        logger.error({ err: error }, "List workspaces error:");
        throw internalServerError();
    }
});

const addWorkspaceMember = asyncHandler(async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;
    const userId = req.user!.userId;

    // Verify active user is admin in this workspace
    const workspace = await WorkspaceModel.findOne({
      _id: id,
      members: {
        $elemMatch: { userId: new Types.ObjectId(userId), role: "admin" },
      },
    });


    if (!workspace) {
      throw verifyAdminError();
    }

    // Add member directly for this setup
    const userToAdd = await WorkspaceModel.db.model("User").findOne({ email });
    if (!userToAdd) {
      throw userEmailNotExistError();
    }

    // Check if already a member
    const isMember = workspace.members.some((m) =>
      m.userId.equals(userToAdd._id),
    );
    if (isMember) {
      throw userAlreadyMemberError();
    }

    workspace.members.push({ userId: userToAdd._id, role: role || "member" });
    await workspace.save();

    logger.info(
      { workspaceId: id, newUserId: userToAdd._id },
      "Member added to workspace",
    );

    return res.status(200).json(
      new ApiResponse(200, "Member added successfuly", {
        data: null,
      }),
    );
  } catch (error) {
    logger.error({ err: error }, "Add workspace member error");
    throw internalServerError;
  }

});


export { createWorkspace, listWorkspaces, addWorkspaceMember };