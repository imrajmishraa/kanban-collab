import { Router } from "express";

import {
  createWorkspace,
  listWorkspaces,
  addWorkspaceMember,
  updateWorkspace,
  deleteWorkspace,
} from "../../../controllers/workspaces/workspaces";

import { authenticateJWT } from "../../../middleware/auth.middleware";
import { validateSchema } from "../../../middleware/validate.middleware";
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  addWorkspaceMemberSchema,
  listWorkspacesQuerySchema,
  workspaceParamsSchema,
} from "../../../validators/kanban/workspace/workspaceValidator";



const router = Router();

router.use(authenticateJWT);

// POST /api/v1/workspaces
router.post("/", validateSchema(createWorkspaceSchema), createWorkspace);

// GET /api/v1/workspaces?search=&page=&limit=
router.get(
  "/",
  validateSchema({ query: listWorkspacesQuerySchema }),
  listWorkspaces,
);

// PATCH /api/v1/workspaces/:workspaceId
router.patch(
  "/:workspaceId",
  validateSchema({
    ...updateWorkspaceSchema,
    params: workspaceParamsSchema,
  }),
  updateWorkspace,
);

// DELETE /api/v1/workspaces/:workspaceId
router.delete(
  "/:workspaceId",
  validateSchema({ params: workspaceParamsSchema }),
  deleteWorkspace,
);

// POST /api/v1/workspaces/:workspaceId/members
router.post(
  "/:workspaceId/members",
  validateSchema({
    ...addWorkspaceMemberSchema,
    params: workspaceParamsSchema,
  }),
  addWorkspaceMember,
);

export default router;
