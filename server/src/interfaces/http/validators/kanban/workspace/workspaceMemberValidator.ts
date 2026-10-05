import { z } from "zod";
import { objectIdSchema } from "../../common/objectId";

/** `req.params` for member-scoped workspace routes. */
export const workspaceMemberParamsSchema = z.object({
  workspaceId: objectIdSchema,
  memberId: objectIdSchema,
});

export const updateWorkspaceMemberRoleSchema = {
  body: z.object({
    role: z.enum(["owner", "admin", "member", "guest"]),
  }),
};
