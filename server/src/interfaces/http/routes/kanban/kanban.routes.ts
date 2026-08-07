import { Router } from 'express';
import { createWorkspace, listWorkspaces, addWorkspaceMember, deleteWorkspace } from '../../controllers/workspaces/workspaces';
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

  /* 
    Workspaces 
  */ 
//  create new workspace
  router.post(
    "/workspaces",
    validateSchema(createWorkspaceSchema),
    createWorkspace,
  );

  // get workspace lists
  router.get('/workspaces', listWorkspaces);

  // add members to workspace
  router.post(
    "/workspaces/:id/members",
    validateSchema(updateWorkspaceSchema),
    addWorkspaceMember,
  );

  // delete workspace 
  router.delete("/workspaces/:id", deleteWorkspace);


  /*
    Boards
  */ 
  // create new board
    router.post('/boards',validateSchema(createBoardSchema), createBoard);
  
    // update board
  router.patch(
    "/:boardId",
    authenticateJWT,
    validateSchema(updateBoardSchema),
    //   updateBoard,
  );

  // get lists of boards
  router.get("/boards", validateSchema(boardQuerySchema), listBoards);

  // get boards by id
  router.get(
    "/boards/:boardId",
    validateSchema({
      params: boardParamsSchema,
    }),
    getBoardDetails,
  );

  /*
    Columns
  */ 

  // Create new column
  router.post("/columns", validateSchema(createColumnSchema), createColumn);

  /*
  Cards
  */ 
 
  // Create new card
  router.post("/cards", validateSchema(createCardSchema), createCard);
  
  // move the card
  router.patch("/cards/:id/move", validateSchema(moveCardSchema), moveCard);

  /*
  Attachments
  */ 

  // upload doc
  router.post('/attachments/presign', signUpload);

  /*
    Search
  */ 

  // search cards 
  router.get('/cards/search', searchCards);

export default router;
