import { Router } from "express";

import {
  createBoard,
  updateBoard,
  listBoards,
  getBoardDetails,
  deleteBoard,
  shareBoard,
} from "../../controllers/boards/boards";
import {
  createColumn,
  updateColumn,
  deleteColumn,
} from "../../controllers/columns/columns";
import {
  createCard,
  moveCard,
  updateCard,
  deleteCard,
} from "../../controllers/cards/cards";
import { searchCards } from "../../controllers/search/search";
import { getImageKitAuth } from "../../controllers/fileUpload/fileUpload";
import {
  listCardAttachments,
  addCardAttachment,
  removeCardAttachment,
} from "../../controllers/attachments/cardAttachments";
import {
  listComments,
  createComment,
  deleteComment,
} from "../../controllers/comments/comments";
import { listBoardActivity } from "../../controllers/activity/activity";

import { authenticateJWT } from "../../middleware/auth.middleware";
import { validateSchema } from "../../middleware/validate.middleware";

import {
  boardParamsSchema,
  boardQuerySchema,
  createBoardSchema,
  updateBoardSchema,
} from "../../validators/kanban/board.validator";
import {
  createCardSchema,
  moveCardSchema,
  updateCardSchema,
  cardParamsSchema,
} from "../../validators/kanban/card.validator";
import {
  cardCommentParamsSchema,
  commentParamsSchema,
  createCommentSchema,
} from "../../validators/kanban/comment.validator";
import { shareBoardSchema } from "../../validators/kanban/share.validator";
import {
  addAttachmentSchema,
  cardAttachmentParamsSchema,
  cardOnlyParamsSchema,
} from "../../validators/kanban/attachment.validator";
import {
  columnParamsSchema,
  createColumnSchema,
  updateColumnSchema,
} from "../../validators/kanban/column.validator";

const router = Router();

router.use(authenticateJWT);

// BOARDS

router.post("/boards", validateSchema(createBoardSchema), createBoard);

router.get("/boards", validateSchema(boardQuerySchema), listBoards);

router.get(
  "/boards/:boardId",
  validateSchema({ params: boardParamsSchema }),
  getBoardDetails,
);

router.patch(
  "/boards/:boardId",
  validateSchema({
    ...updateBoardSchema,
    params: boardParamsSchema,
  }),
  updateBoard,
);

router.delete(
  "/boards/:boardId",
  validateSchema({ params: boardParamsSchema }),
  deleteBoard,
);

// POST /api/v1/boards/:boardId/share
router.post(
  "/boards/:boardId/share",
  validateSchema(shareBoardSchema),
  shareBoard,
);

// COLUMNS

router.post("/columns", validateSchema(createColumnSchema), createColumn);

router.patch(
  "/columns/:columnId",
  validateSchema({
    ...updateColumnSchema,
    params: columnParamsSchema,
  }),
  updateColumn,
);

router.delete(
  "/columns/:columnId",
  validateSchema({ params: columnParamsSchema }),
  deleteColumn,
);

// CARDS

router.get("/cards/search", searchCards);

router.post("/cards", validateSchema(createCardSchema), createCard);

router.patch(
  "/cards/:cardId/move",
  validateSchema({
    ...moveCardSchema,
    params: cardParamsSchema,
  }),
  moveCard,
);

router.patch(
  "/cards/:cardId",
  validateSchema({
    ...updateCardSchema,
    params: cardParamsSchema,
  }),
  updateCard,
);

router.delete(
  "/cards/:cardId",
  validateSchema({ params: cardParamsSchema }),
  deleteCard,
);

// COMMENTS

router.get(
  "/cards/:cardId/comments",
  validateSchema({ params: cardCommentParamsSchema }),
  listComments,
);

router.post(
  "/cards/:cardId/comments",
  validateSchema(createCommentSchema),
  createComment,
);

router.delete(
  "/comments/:commentId",
  validateSchema({ params: commentParamsSchema }),
  deleteComment,
);

// ACTIVITY

router.get(
  "/boards/:boardId/activity",
  validateSchema({ params: boardParamsSchema }),
  listBoardActivity,
);

// ATTACHMENTS

// ImageKit client-side upload auth (T15) — replaces the mock S3 presign.
router.get("/attachments/imagekit-auth", getImageKitAuth);

router.get(
  "/cards/:cardId/attachments",
  validateSchema({ params: cardOnlyParamsSchema }),
  listCardAttachments,
);

router.post(
  "/cards/:cardId/attachments",
  validateSchema(addAttachmentSchema),
  addCardAttachment,
);

router.delete(
  "/cards/:cardId/attachments/:attachmentId",
  validateSchema({ params: cardAttachmentParamsSchema }),
  removeCardAttachment,
);

export default router;
