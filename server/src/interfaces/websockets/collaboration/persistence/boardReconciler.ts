import { Types } from "mongoose";
import type * as Y from "yjs";

import {
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
 * Projection is idempotent: it upserts every live record and prunes rows for
 * the board that no longer exist in the CRDT.
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
    const snapshot = readBoardSnapshot(document);

    if (!snapshot) {
      // Not seeded yet — nothing to project.
      return;
    }

    const boardObjectId = toObjectId(snapshot.id);

    if (!boardObjectId) {
      logger.warn(
        { documentName, boardId: snapshot.id },
        "Skipping board reconciliation: board id is not an ObjectId.",
      );
      return;
    }

    try {
      const liveColumnIds: Types.ObjectId[] = [];
      const liveCardIds: Types.ObjectId[] = [];

      for (const { record, cards } of snapshot.columns) {
        const columnId = toObjectId(record.id);
        const columnWorkspaceId = toObjectId(record.workspaceId);

        if (!columnId || !columnWorkspaceId) {
          continue;
        }

        liveColumnIds.push(columnId);

        await ColumnModel.updateOne(
          { _id: columnId },
          {
            $set: {
              boardId: toObjectId(record.boardId) ?? boardObjectId,
              workspaceId: columnWorkspaceId,
              name: record.name,
              orderIndex: record.orderIndex,
            },
          },
          { upsert: true, setDefaultsOnInsert: true },
        );

        for (const card of cards) {
          const cardId = toObjectId(card.id);
          const cardWorkspaceId =
            toObjectId(card.workspaceId) ?? columnWorkspaceId;

          if (!cardId) {
            continue;
          }

          liveCardIds.push(cardId);

          await CardModel.updateOne(
            { _id: cardId },
            {
              $set: {
                workspaceId: cardWorkspaceId,
                columnId,
                boardId: toObjectId(card.boardId) ?? boardObjectId,
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

      // Prune rows that no longer exist in the CRDT.
      await ColumnModel.deleteMany({
        boardId: boardObjectId,
        _id: { $nin: liveColumnIds },
      });

      await CardModel.deleteMany({
        boardId: boardObjectId,
        _id: { $nin: liveCardIds },
      });

      logger.debug(
        {
          documentName,
          boardId: snapshot.id,
          columns: liveColumnIds.length,
          cards: liveCardIds.length,
        },
        "Reconciled collaborative board into MongoDB.",
      );
    } catch (error) {
      logger.error(
        { err: error, documentName, boardId: snapshot.id },
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
