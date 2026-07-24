import { Router } from 'express';
import { createWorkspace, listWorkspaces, addWorkspaceMember } from '../../controllers/workspaces/workspaces';
import { createBoard, listBoards, getBoardDetails } from "../../controllers/boards/boards";
import { createColumn  } from '../../controllers/columns/columns';
import { createCard, moveCard } from '../../controllers/cards/cards';
import { searchCards } from '../../controllers/search/search';
import { signUpload } from '../../controllers/fileUpload/fileUpload';
import { authenticateJWT } from '../../middleware/auth.middleware';


const router = Router();

// Protect all routes with JWT Auth
router.use(authenticateJWT);

// Workspaces
router.post('/workspaces', createWorkspace);
router.get('/workspaces', listWorkspaces);
router.post('/workspaces/:id/members', addWorkspaceMember);


// Boards
router.post('/boards', createBoard);
router.get('/boards', listBoards);
router.get('/boards/:id', getBoardDetails);

// Columns
router.post("/columns", createColumn);

// Cards
router.post('/cards', createCard);
router.patch('/cards/:id/move', moveCard);

// Attachments
router.post('/attachments/presign', signUpload);

// Search
router.get('/cards/search', searchCards);

export default router;
