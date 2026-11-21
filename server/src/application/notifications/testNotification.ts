/**
 * Push a notification to one account, for testing the inbox.
 *
 * The inbox is the one surface that is hard to look at without waiting for real
 * activity: a reminder is emitted by a cron at 08:00, an overdue job runs hourly,
 * and an assignment needs two accounts. This creates the row directly, through
 * the same `createNotification()` the real emitters use, so the channel defaults,
 * the `{ userId, dedupeKey }` unique index and the read model all behave exactly
 * as they do in production.
 *
 * Kept out of `scripts/` so it can be tested: the script is argv parsing and a
 * console table, this is the part with branches.
 */

import { Types } from "mongoose";

import {
  BoardModel,
  UserModel,
  WorkspaceModel,
} from "../../infrastructure/db/mongoose/schemas";
import type {
  NotificationType,
  WorkspaceRole,
} from "../../infrastructure/db/mongoose/schemas";

import { createNotification } from "./createNotification";

/** A human title per type, so `--title` is optional. */
export const TITLE_BY_TYPE: Record<NotificationType, string> = {
  CARD_ASSIGNED: "You were assigned a card",
  CARD_MOVED: "A card moved",
  CARD_DUE_SOON: "A card is due soon",
  CARD_OVERDUE: "A card is overdue",
  COMMENT_ADDED: "New comment",
  MENTION: "You were mentioned",
  WORKSPACE_INVITE: "You were invited to a workspace",
  WORKSPACE_ROLE_CHANGED: "Your role changed",
  WORKSPACE_DELETION_SCHEDULED: "A workspace is scheduled for deletion",
  BOARD_SHARED: "A board was shared with you",
};

export interface PushTarget {
  userId: string;
  email: string;
  workspaceId: string;
  workspaceName: string;
  role: WorkspaceRole;
  boardId: string | null;
  boardName: string | null;
}

export interface ResolveInput {
  email: string;
  /** A workspace id, when the account is in more than one. */
  workspaceId?: string | undefined;
  /** A board id or a board name, to attach the notification to a board. */
  board?: string | undefined;
}

export class PushTargetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PushTargetError";
  }
}

/**
 * Find the account, the workspace and (optionally) the board the notification
 * should point at.
 *
 * Everything is resolved by lookup rather than accepted as an id, because the
 * point of the script is to be usable without opening the database: an email is
 * the only thing a tester reliably knows.
 */
export async function resolvePushTarget(
  input: ResolveInput,
): Promise<PushTarget> {
  const email = input.email.trim().toLowerCase();

  if (!email) {
    throw new PushTargetError("--email is required.");
  }

  const user = (await UserModel.findOne({ email })
    .select("_id email")
    .lean()) as { _id: Types.ObjectId; email: string } | null;

  if (!user) {
    throw new PushTargetError(`No account with email ${email}.`);
  }

  const workspaces = (await WorkspaceModel.find({
    "members.userId": user._id,
  })
    .select("_id name members.userId members.role")
    .lean()) as Array<{
    _id: Types.ObjectId;
    name: string;
    members: Array<{ userId: Types.ObjectId; role: WorkspaceRole }>;
  }>;

  if (workspaces.length === 0) {
    throw new PushTargetError(
      `${email} is not a member of any workspace, so a notification would have nowhere to point.`,
    );
  }

  const workspace = input.workspaceId
    ? workspaces.find((entry) => entry._id.toString() === input.workspaceId)
    : workspaces[0];

  if (!workspace) {
    throw new PushTargetError(
      `${email} is not in workspace ${input.workspaceId}. In: ${workspaces
        .map((entry) => `${entry.name} (${entry._id.toString()})`)
        .join(", ")}`,
    );
  }

  const member = workspace.members.find(
    (entry) => entry.userId.toString() === user._id.toString(),
  );

  let boardId: string | null = null;
  let boardName: string | null = null;

  if (input.board) {
    const byId = Types.ObjectId.isValid(input.board)
      ? ((await BoardModel.findOne({
          _id: input.board,
          workspaceId: workspace._id,
        })
          .select("_id name")
          .lean()) as { _id: Types.ObjectId; name: string } | null)
      : null;

    const board =
      byId ??
      ((await BoardModel.findOne({
        workspaceId: workspace._id,
        name: {
          $regex: `^${input.board.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          $options: "i",
        },
      })
        .select("_id name")
        .lean()) as { _id: Types.ObjectId; name: string } | null);

    if (!board) {
      throw new PushTargetError(
        `No board "${input.board}" in ${workspace.name} (${workspace._id.toString()}).`,
      );
    }

    boardId = board._id.toString();
    boardName = board.name;
  }

  return {
    userId: user._id.toString(),
    email: user.email,
    workspaceId: workspace._id.toString(),
    workspaceName: workspace.name,
    role: member?.role ?? "member",
    boardId,
    boardName,
  };
}

export interface PushInput extends ResolveInput {
  type: NotificationType;
  title?: string | undefined;
  message?: string | undefined;
  /** How many rows to create. Distinct rows, not duplicates. */
  count?: number | undefined;
  /**
   * Reuse one dedupe key instead of a fresh one per row, so a second run of the
   * same command is deduped by the unique index — which is what proves the
   * index works.
   */
  stableDedupeKey?: boolean | undefined;
  /** Resolve everything, write nothing. */
  dryRun?: boolean | undefined;
  /** Injected in tests. */
  now?: Date | undefined;
}

export interface PushResult {
  target: PushTarget;
  created: number;
  deduped: number;
  ids: string[];
  dryRun: boolean;
}

const DEFAULT_MESSAGE =
  "Created by scripts/push-notification.ts — safe to delete.";

export async function pushTestNotifications(
  input: PushInput,
): Promise<PushResult> {
  const target = await resolvePushTarget(input);

  const count = Math.max(1, Math.min(input.count ?? 1, 50));
  const now = input.now ?? new Date();

  const title = input.title?.trim() || TITLE_BY_TYPE[input.type];
  const message = input.message?.trim() || DEFAULT_MESSAGE;

  if (input.dryRun) {
    return { target, created: 0, deduped: 0, ids: [], dryRun: true };
  }

  const ids: string[] = [];
  let deduped = 0;

  for (let index = 0; index < count; index += 1) {
    /* A fresh key per row keeps them distinct; a stable one lets the second run
       of the same command demonstrate the dedupe index. */
    const dedupeKey = input.stableDedupeKey
      ? `test:${input.type}:${target.userId}`
      : `test:${now.toISOString()}:${index}`;

    const result = await createNotification({
      userId: target.userId,
      workspaceId: target.workspaceId,
      type: input.type,
      title,
      message,
      ...(target.boardId ? { boardId: target.boardId } : {}),
      metadata: { source: "scripts/push-notification.ts" },
      dedupeKey,
    });

    if (result.created && result.id) {
      ids.push(result.id);
    } else {
      deduped += 1;
    }
  }

  return { target, created: ids.length, deduped, ids, dryRun: false };
}
