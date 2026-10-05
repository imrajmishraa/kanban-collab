import { Types } from "mongoose";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import { ApiResponse } from "../../../../shared/utils/ApiResponse";
import { ApiError } from "../../../../shared/utils/ApiError";
import {
  NoteModel,
  WorkspaceModel,
} from "../../../../infrastructure/db/mongoose/schemas";
import { noteControllerLogger } from "../../../../infrastructure/logging/childLogger";
import { notWorkspaceMemberError } from "../../../../shared/errors/workspace/workspace";

/** Guard instead of `req.user!` — see the dashboard controller for rationale. */
function requireUserId(req: AuthenticatedRequest): string {
  if (!req.user) {
    throw ApiError.unauthorized("Authentication required.");
  }
  return req.user.userId;
}

async function assertWorkspaceMember(
  workspaceId: string,
  userId: string,
): Promise<void> {
  if (!workspaceId || !Types.ObjectId.isValid(workspaceId)) {
    throw ApiError.badRequest("A valid workspaceId is required.");
  }

  const workspace = await WorkspaceModel.findOne({
    _id: workspaceId,
    "members.userId": new Types.ObjectId(userId),
  })
    .select("_id")
    .lean();

  if (!workspace) {
    throw notWorkspaceMemberError();
  }
}

const serializeNote = (note: {
  _id: Types.ObjectId;
  workspaceId: Types.ObjectId;
  boardId?: Types.ObjectId | null;
  userId: Types.ObjectId;
  title: string;
  body: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: note._id.toString(),
  workspaceId: note.workspaceId.toString(),
  boardId: note.boardId ? note.boardId.toString() : null,
  userId: note.userId.toString(),
  title: note.title,
  body: note.body,
  isPinned: note.isPinned,
  createdAt: note.createdAt,
  updatedAt: note.updatedAt,
});

/** GET /api/v1/notes?workspaceId=&boardId= */
const listNotes = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = requireUserId(req);
  const workspaceId = String(req.query["workspaceId"] ?? "");
  const boardId = req.query["boardId"] ? String(req.query["boardId"]) : null;

  await assertWorkspaceMember(workspaceId, userId);

  const filter: Record<string, unknown> = {
    workspaceId: new Types.ObjectId(workspaceId),
  };

  if (boardId) {
    if (!Types.ObjectId.isValid(boardId)) {
      throw ApiError.badRequest("Invalid boardId.");
    }
    filter["boardId"] = new Types.ObjectId(boardId);
  }

  const notes = await NoteModel.find(filter)
    .sort({ isPinned: -1, updatedAt: -1 })
    .lean();

  noteControllerLogger.info(
    { userId, workspaceId, count: notes.length },
    "Notes listed",
  );

  return res.status(200).json(
    new ApiResponse(200, "Notes fetched successfully", {
      notes: notes.map(serializeNote),
    }),
  );
});

/** POST /api/v1/notes */
const createNote = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = requireUserId(req);
  const { workspaceId, boardId, title, body, isPinned } = req.body;

  await assertWorkspaceMember(String(workspaceId), userId);

  if (boardId && !Types.ObjectId.isValid(boardId)) {
    throw ApiError.badRequest("Invalid boardId.");
  }

  const note = await NoteModel.create({
    workspaceId: new Types.ObjectId(String(workspaceId)),
    boardId: boardId ? new Types.ObjectId(String(boardId)) : null,
    userId: new Types.ObjectId(userId),
    title,
    body: body ?? "",
    isPinned: Boolean(isPinned),
  });

  noteControllerLogger.info(
    { userId, noteId: note._id, workspaceId },
    "Note created",
  );

  return res.status(201).json(
    new ApiResponse(201, "Note created successfully", {
      note: serializeNote(note),
    }),
  );
});

/** PATCH /api/v1/notes/:noteId */
const updateNote = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = requireUserId(req);
  const noteId = req.params["noteId"] || req.params["id"];
  const { title, body, isPinned } = req.body;

  if (!noteId || !Types.ObjectId.isValid(noteId)) {
    throw ApiError.badRequest("Invalid note id.");
  }

  const note = await NoteModel.findById(noteId);
  if (!note) {
    throw ApiError.notFound("Note not found.");
  }

  // Only the author may edit their note.
  if (note.userId.toString() !== userId) {
    throw ApiError.forbidden("You can only edit your own notes.");
  }

  if (title !== undefined) note.title = title;
  if (body !== undefined) note.body = body;
  if (isPinned !== undefined) note.isPinned = Boolean(isPinned);

  await note.save();

  noteControllerLogger.info({ userId, noteId: note._id }, "Note updated");

  return res.status(200).json(
    new ApiResponse(200, "Note updated successfully", {
      note: serializeNote(note),
    }),
  );
});

/** DELETE /api/v1/notes/:noteId */
const deleteNote = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = requireUserId(req);
  const noteId = req.params["noteId"] || req.params["id"];

  if (!noteId || !Types.ObjectId.isValid(noteId)) {
    throw ApiError.badRequest("Invalid note id.");
  }

  const note = await NoteModel.findById(noteId);
  if (!note) {
    throw ApiError.notFound("Note not found.");
  }

  if (note.userId.toString() !== userId) {
    throw ApiError.forbidden("You can only delete your own notes.");
  }

  await note.deleteOne();

  noteControllerLogger.info({ userId, noteId: note._id }, "Note deleted");

  return res.status(200).json(
    new ApiResponse(200, "Note deleted successfully", {
      note: { id: note._id.toString() },
    }),
  );
});

export { listNotes, createNote, updateNote, deleteNote };
