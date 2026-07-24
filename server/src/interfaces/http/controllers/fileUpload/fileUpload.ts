import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import { WorkspaceModel, BoardModel, CardModel } from "../../../../infrastructure/db/mongoose/schemas";
import { ApiResponse } from "../../../../shared/utils/ApiResponse";
import { Types } from "mongoose";
import { logger } from "../../../../infrastructure/logging/logger";
import { internalServerError } from "../../../../shared/errors/handler/custom";
import { attachmentsRequiredError, forbiddenWorkspaceError, guestCanNotUploadError } from "../../../../shared/errors/fileUpload/fileUpload";
import { boardNotFoundError } from "../../../../shared/errors/board/board";
import { cardNotFoundError } from "../../../../shared/errors/card/card";


const signUpload = asyncHandler(async (req: AuthenticatedRequest, res) => {
    try {
      const { fileName, fileType, cardId } = req.body;
      const userId = req.user!.userId;

      if (!fileName || !fileType || !cardId) {
        throw attachmentsRequiredError();
      }

      const card = await CardModel.findById(cardId);
      if (!card) {
        throw cardNotFoundError();
      }
      const board = await BoardModel.findById(card.boardId);
      if (!board) {
        throw boardNotFoundError();
      }

      const workspace = await WorkspaceModel.findOne({
        _id: board.workspaceId,
        "members.userId": new Types.ObjectId(userId),
      });
      if (!workspace) {
        throw forbiddenWorkspaceError();
      }

      const member = workspace.members.find(
        (m) => m.userId.toString() === userId,
      );
      if (!member || member.role === "guest") {
        throw guestCanNotUploadError();
      }

      // Generate mock signed URL
      const mockKey = `${Date.now()}-${fileName}`;
      const uploadUrl = `https://enterprise-kanban-uploads.s3.amazonaws.com/${mockKey}?AWSAccessKeyId=mock&Expires=123&Signature=mock`;
      const fileUrl = `https://enterprise-kanban-uploads.s3.amazonaws.com/${mockKey}`;

      return res.status(200).json(
        new ApiResponse(200, "File uploaded successfully", {
          data: {
            uploadUrl,
            fileUrl,
          }
        }),
      );
    } catch (error) {
      logger.error("Sign S3 upload error:", error);
      throw internalServerError();
    }
});


export { signUpload };