import { Router } from "express";
import { z } from "zod";

import {
  listNotes,
  createNote,
  updateNote,
  deleteNote,
} from "../../controllers/notes/notes";

import { authenticateJWT } from "../../middleware/auth.middleware";
import { validateSchema } from "../../middleware/validate.middleware";
import { objectIdSchema } from "../../validators/common/objectId";

const router = Router();

router.use(authenticateJWT);

const noteParamsSchema = z.object({
  noteId: objectIdSchema,
});

const createNoteSchema = {
  body: z.object({
    workspaceId: objectIdSchema,
    boardId: objectIdSchema.optional(),
    title: z.string().trim().min(1, "Title is required.").max(200),
    body: z.string().max(20000).optional(),
    isPinned: z.boolean().optional(),
  }),
};

const updateNoteSchema = {
  params: noteParamsSchema,
  body: z
    .object({
      title: z.string().trim().min(1).max(200).optional(),
      body: z.string().max(20000).optional(),
      isPinned: z.boolean().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field must be provided for update.",
    }),
};

// GET /api/v1/notes?workspaceId=&boardId=
router.get("/", listNotes);

// POST /api/v1/notes
router.post("/", validateSchema(createNoteSchema), createNote);

// PATCH /api/v1/notes/:noteId
router.patch("/:noteId", validateSchema(updateNoteSchema), updateNote);

// DELETE /api/v1/notes/:noteId
router.delete(
  "/:noteId",
  validateSchema({ params: noteParamsSchema }),
  deleteNote,
);

export default router;
