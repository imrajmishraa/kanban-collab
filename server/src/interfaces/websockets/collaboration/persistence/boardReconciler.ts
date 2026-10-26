import { Types } from "mongoose";
import type * as Y from "yjs";

import {
  BoardModel,
  CardModel,
  ColumnModel,
} from "../../../../infrastructure/db/mongoose/schemas";
import { logger } from "../../../../infrastructure/logging/logger";

import { readBoardSnapshot } from "../yjs/boardSchema";

/**
 * Yjs → MongoDB reconciliation (T6).
 *
 * The collaborative document is the real-time source of truth. This class
 * projects it back into the relational `columns` / `cards` collections so the
 * ordinary REST endpoints (`GET /boards/:id`, search, dashboard counts) keep
 * agreeing with what collaborators see live.
 *
 * Triggers:
 *   - debounced on every CRDT update (RECONCILE_DEBOUNCE_MS)
 *   - explicitly on last-client-close and on document destroy (flush)
 *   - from the `yjsSnapshot` cron as a safety net
 *
 * SECURITY (C-1): the board identity is taken from `documentName` — the id the
 * WebSocket session was *authorised* for — and never from the client-authored
 * `meta.id`, record `boardId` or record `workspaceId`. The workspace is read
 * from the Board document. Pruning is gated so an unseeded or partially-seeded
 * document can never delete rows.
 */

const RECONCILE_DEBOUNCE_MS = 2_000;

function toObjectId(value: unknown): Types.ObjectId | null {
  if (value instanceof Types.ObjectId) return value;
  if (typeof value === "string" && /^[a-f0-9]{24}$/.test(value)) {
    return new Types.ObjectId(value);
  }
  return null;
}

class BoardReconciler {
  private readonly attached = new WeakSet<Y.Doc>();
  private readonly timers = new Map<string, NodeJS.Timeout>();

  /** Attach the reconciler to a document (once per Y.Doc). */
  public attach(documentName: string, document: Y.Doc): void {
    if (this.attached.has(document)) {
      return;
    }

    this.attached.add(document);

    document.on("update", () => this.schedule(documentName, document));

    logger.debug({ documentName }, "Board reconciler attached.");
  }

  private schedule(documentName: string, document: Y.Doc): void {
    const existing = this.timers.get(documentName);

    if (existing) {
      clearTimeout(existing);
    }

    const timer = setTimeout(() => {
      this.timers.delete(documentName);
      void this.reconcile(documentName, document);
    }, RECONCILE_DEBOUNCE_MS);

    // A debounce timer must never keep the process (or a Jest run) alive.
    timer.unref?.();

    this.timers.set(documentName, timer);
  }

  /** Cancel any pending debounce and reconcile immediately. */
  public async flush(documentName: string, document: Y.Doc): Promise<void> {
    const existing = this.timers.get(documentName);

    if (existing) {
      clearTimeout(existing);
      this.timers.delete(documentName);
    }

    await this.reconcile(documentName, document);
  }

  /** Project the CRDT board into MongoDB. */
  public async reconcile(documentName: string, document: Y.Doc): Promise<void> {
    // C-1: the authoritative board id is the document name (the id the socket
    // was authorised for), never a value from inside the document.
    const boardObjectId = toObjectId(documentName);

    if (!boardObjectId) {
      logger.warn(
        { documentName },
        "Skipping board reconciliation: document name is not an ObjectId.",
      );
      return;
    }

    const snapshot = readBoardSnapshot(document);

    if (!snapshot) {
      // Not seeded yet — nothing to project.
      return;
    }

    if (snapshot.id !== documentName) {
      // The document claims a different board id. Ignore it — reconcile
      // against the authorised id only. This is the cross-tenant guard.
      logger.warn(
        { documentName, clientBoardId: snapshot.id },
        "Collaborative document reports a different board id; ignoring it and using the authorised document name.",
      );
    }

    try {
      // C-1: workspace is authoritative from the Board, not from the document.
      // Loaded inside the try so a DB failure is logged, not thrown.
      const board = await BoardModel.findById(boardObjectId)
        .select("_id workspaceId")
        .lean();

      if (!board) {
        logger.warn(
          { boardId: documentName },
          "Skipping board reconciliation: board not found.",
        );
        return;
      }

      const workspaceId = board.workspaceId;

      const liveColumnIds: Types.ObjectId[] = [];
      const liveCardIds: Types.ObjectId[] = [];

      for (const { record, cards } of snapshot.columns) {
        const columnId = toObjectId(record.id);

        if (!columnId) {
          continue;
        }

        liveColumnIds.push(columnId);

        // Scope the match to this board so a record can never address another
        // board's row. Client-supplied boardId/workspaceId are ignored.
        await ColumnModel.updateOne(
          { _id: columnId, boardId: boardObjectId },
          {
            $set: {
              boardId: boardObjectId,
              workspaceId,
              name: record.name,
              orderIndex: record.orderIndex,
            },
          },
          { upsert: true, setDefaultsOnInsert: true },
        );

        for (const card of cards) {
          const cardId = toObjectId(card.id);

          if (!cardId) {
            continue;
          }

          liveCardIds.push(cardId);

          await CardModel.updateOne(
            { _id: cardId, boardId: boardObjectId },
            {
              $set: {
                boardId: boardObjectId,
                workspaceId,
                columnId,
                title: card.title,
                description: card.description ?? "",
                orderIndex: card.orderIndex,
                labels: card.labels ?? [],
                members: (card.members ?? [])
                  .map(toObjectId)
                  .filter((id): id is Types.ObjectId => id !== null),
                dueDate: card.dueDate ? new Date(card.dueDate) : null,
                isArchived: card.isArchived ?? false,
              },
            },
            { upsert: true, setDefaultsOnInsert: true },
          );
        }
      }

      /*
       * Gated prune (C-1). Deleting is the dangerous half of reconciliation:
       *
       *  - Skip entirely when the document exposes no columns. An unseeded or
       *    partially-seeded document has an empty live set, and an ungated
       *    `$nin: []` would wipe the whole board (seed race).
       *  - Only prune cards that belong to columns the document actually knows
       *    about, so cards in columns absent from the CRDT are left untouched.
       */
      if (liveColumnIds.length > 0) {
        await ColumnModel.deleteMany({
          boardId: boardObjectId,
          _id: { $nin: liveColumnIds },
        });

        await CardModel.deleteMany({
          boardId: boardObjectId,
          columnId: { $in: liveColumnIds },
          _id: { $nin: liveCardIds },
        });
      } else {
        logger.warn(
          { boardId: documentName },
          "Skipping reconciliation prune: document has no columns (possibly unseeded).",
        );
      }

      logger.debug(
        {
          documentName,
          columns: liveColumnIds.length,
          cards: liveCardIds.length,
        },
        "Reconciled collaborative board into MongoDB.",
      );
    } catch (error) {
      logger.error(
        { err: error, documentName },
        "Failed to reconcile collaborative board into MongoDB.",
      );
    }
  }

  /** Cancel every pending reconcile timer (shutdown/testing). */
  public clear(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }
}

export const boardReconciler = new BoardReconciler();
