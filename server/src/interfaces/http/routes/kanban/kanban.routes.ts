import { Router } from 'express';
import { createWorkspace, listWorkspaces, addWorkspaceMember } from '../../controllers/workspaces/workspaces';
import { createBoard, listBoards, getBoardDetails } from "../../controllers/boards/boards";
import { createColumn  } from '../../controllers/columns/columns';
import { createCard, moveCard } from '../../controllers/cards/cards';
import { searchCards } from '../../controllers/search/search';
import { signUpload } from '../../controllers/fileUpload/fileUpload';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { createWorkspaceSchema, updateWorkspaceSchema } from '../../validators/kanban/workspace.validator';
import { validateSchema } from '../../middleware/validate.middleware';
import { boardParamsSchema, boardQuerySchema, createBoardSchema, updateBoardSchema } from '../../validators/kanban/board.validator';
import { createCardSchema, moveCardSchema } from '../../validators/kanban/card.validator';
import { createColumnSchema } from '../../validators/kanban/column.validator';


const router = Router();

// Protect all routes with JWT Auth
router.use(authenticateJWT);

// Workspaces
router.post(
  "/workspaces",
  validateSchema(createWorkspaceSchema),
  createWorkspace,
);
router.get('/workspaces', listWorkspaces);
router.post(
  "/workspaces/:id/members",
  validateSchema(updateWorkspaceSchema),
  addWorkspaceMember,
);


// Boards
router.post('/boards',validateSchema(createBoardSchema), createBoard);
// todo
router.patch(
  "/:boardId",
  authenticateJWT,
  validateSchema(updateBoardSchema),
//   updateBoard,
);
router.get("/boards", validateSchema(boardQuerySchema), listBoards);
router.get(
  "/boards/:boardId",
  validateSchema({
    params: boardParamsSchema,
  }),
  getBoardDetails,
);

// Columns
router.post("/columns", validateSchema(createColumnSchema), createColumn);

// Cards
router.post("/cards", validateSchema(createCardSchema), createCard);
router.patch("/cards/:id/move", validateSchema(moveCardSchema), moveCard);

// Attachments
router.post('/attachments/presign', signUpload);

// Search
router.get('/cards/search', searchCards);

export default router;
