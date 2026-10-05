import { Router } from "express";

import {
  createBoard,
  updateBoard,
  listBoards,
  getBoardDetails,
  deleteBoard,
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
import { signUpload } from "../../controllers/fileUpload/fileUpload";

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

// ATTACHMENTS

router.post("/attachments/presign", signUpload);

export default router;
