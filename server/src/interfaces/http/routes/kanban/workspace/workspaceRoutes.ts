import { Router } from "express";

import {
  createWorkspace,
  listWorkspaces,
  addWorkspaceMember,
  listWorkspaceMembers,
  updateWorkspace,
  deleteWorkspace,
  updateWorkspaceMemberRole,
  removeWorkspaceMember,
  leaveWorkspace,
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
import {
  workspaceMemberParamsSchema,
  updateWorkspaceMemberRoleSchema,
} from "../../../validators/kanban/workspace/workspaceMemberValidator";

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

// GET /api/v1/workspaces/:workspaceId/members
router.get(
  "/:workspaceId/members",
  validateSchema({ params: workspaceParamsSchema }),
  listWorkspaceMembers,
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

// PATCH /api/v1/workspaces/:workspaceId/members/:memberId
router.patch(
  "/:workspaceId/members/:memberId",
  validateSchema({
    ...updateWorkspaceMemberRoleSchema,
    params: workspaceMemberParamsSchema,
  }),
  updateWorkspaceMemberRole,
);

// DELETE /api/v1/workspaces/:workspaceId/members/:memberId
router.delete(
  "/:workspaceId/members/:memberId",
  validateSchema({ params: workspaceMemberParamsSchema }),
  removeWorkspaceMember,
);

// POST /api/v1/workspaces/:workspaceId/leave
router.post(
  "/:workspaceId/leave",
  validateSchema({ params: workspaceParamsSchema }),
  leaveWorkspace,
);

export default router;
