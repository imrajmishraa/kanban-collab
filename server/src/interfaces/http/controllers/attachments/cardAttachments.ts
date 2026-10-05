import { Types } from "mongoose";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import { ApiResponse } from "../../../../shared/utils/ApiResponse";
import { ApiError } from "../../../../shared/utils/ApiError";
import {
  CardModel,
  WorkspaceModel,
} from "../../../../infrastructure/db/mongoose/schemas";
import { fileUploadControllerLogger } from "../../../../infrastructure/logging/childLogger";
import { cardNotFoundError } from "../../../../shared/errors/card/card";
import { notWorkspaceMemberError } from "../../../../shared/errors/workspace/workspace";
import { guestCannotModifyBoardError } from "../../../../shared/errors/board/board";

function requireUserId(req: AuthenticatedRequest): string {
  if (!req.user) {
    throw ApiError.unauthorized("Authentication required.");
  }
  return req.user.userId;
}

/** Load a card and confirm the caller is a member of its workspace (T15). */
async function loadCardForMember(cardId: string, userId: string) {
  const card = await CardModel.findById(cardId);

  if (!card) {
    throw cardNotFoundError();
  }

  const workspace = await WorkspaceModel.findOne({
    _id: card.workspaceId,
    "members.userId": new Types.ObjectId(userId),
  })
    .select("members")
    .lean();

  if (!workspace) {
    throw notWorkspaceMemberError();
  }

  const member = workspace.members.find((m) => m.userId.toString() === userId);

  if (!member) {
    throw notWorkspaceMemberError();
  }

  return { card, role: member.role };
}

function serializeAttachment(attachment: {
  _id: Types.ObjectId;
  url: string;
  name: string;
  fileType: string;
  size: number;
  uploadedBy: Types.ObjectId;
  createdAt: Date;
}) {
  return {
    id: attachment._id.toString(),
    url: attachment.url,
    name: attachment.name,
    fileType: attachment.fileType,
    size: attachment.size,
    uploadedBy: attachment.uploadedBy.toString(),
    createdAt: attachment.createdAt,
  };
}

/** GET /api/v1/cards/:cardId/attachments */
const listCardAttachments = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const userId = requireUserId(req);
    const { cardId } = req.params as { cardId: string };

    const { card } = await loadCardForMember(cardId, userId);

    return res.status(200).json(
      new ApiResponse(200, "Attachments fetched successfully", {
        attachments: card.attachments.map(serializeAttachment),
      }),
    );
  },
);

/**
 * POST /api/v1/cards/:cardId/attachments
 *
 * Records a file that the browser has already uploaded to ImageKit. The
 * server never sees the bytes — it only stores the resulting URL.
 */
const addCardAttachment = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const userId = requireUserId(req);
    const { cardId } = req.params as { cardId: string };
    const { url, name, fileType, size } = (req.validated?.body ?? req.body) as {
      url: string;
      name: string;
      fileType: string;
      size?: number;
    };

    const { role } = await loadCardForMember(cardId, userId);

    if (role === "guest") {
      throw guestCannotModifyBoardError();
    }

    // Generate the subdocument id here so it can be returned immediately and
    // used as the delete key. `$push` avoids the plain-array typing of
    // `ICard.attachments`.
    const attachmentId = new Types.ObjectId();

    const updated = await CardModel.findByIdAndUpdate(
      cardId,
      {
        $push: {
          attachments: {
            _id: attachmentId,
            url,
            name,
            fileType,
            size: size ?? 0,
            uploadedBy: new Types.ObjectId(userId),
            createdAt: new Date(),
          },
        },
      },
      { new: true },
    ).lean();

    const attachment = updated?.attachments.find(
      (a) => a._id.toString() === attachmentId.toString(),
    );

    fileUploadControllerLogger.info(
      { userId, cardId, attachmentId: attachmentId.toString() },
      "Card attachment added",
    );

    return res.status(201).json(
      new ApiResponse(201, "Attachment added successfully", {
        attachment: attachment
          ? serializeAttachment(attachment)
          : {
              id: attachmentId.toString(),
              url,
              name,
              fileType,
              size: size ?? 0,
            },
      }),
    );
  },
);

/** DELETE /api/v1/cards/:cardId/attachments/:attachmentId */
const removeCardAttachment = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const userId = requireUserId(req);
    const { cardId, attachmentId } = req.params as {
      cardId: string;
      attachmentId: string;
    };

    const { card, role } = await loadCardForMember(cardId, userId);

    if (role === "guest") {
      throw guestCannotModifyBoardError();
    }

    const exists = card.attachments.some(
      (a) => a._id.toString() === attachmentId,
    );

    if (!exists) {
      throw ApiError.notFound("Attachment not found.");
    }

    await CardModel.updateOne(
      { _id: card._id },
      { $pull: { attachments: { _id: new Types.ObjectId(attachmentId) } } },
    );

    fileUploadControllerLogger.info(
      { userId, cardId, attachmentId },
      "Card attachment removed",
    );

    return res.status(200).json(
      new ApiResponse(200, "Attachment removed successfully", {
        attachment: { id: attachmentId },
      }),
    );
  },
);

export { listCardAttachments, addCardAttachment, removeCardAttachment };
