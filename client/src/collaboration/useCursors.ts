/**
 * useCursors — broadcast and read "who is on which card/column" (T7).
 *
 * Cursor/selection is ephemeral presence, so it rides on Yjs awareness (never
 * persisted). `AwarenessUser.cursor` was already typed but nothing set it;
 * this hook is that missing wiring.
 *
 *   const { setCursor, clearCursor, peersOnCard } = useCursors(awareness);
 *   // on card focus:
 *   setCursor({ cardId, columnId });
 *   // on blur / unmount:
 *   clearCursor();
 *
 * React Compiler note: the effect body never calls `setState` synchronously —
 * updates are scheduled through `requestAnimationFrame`, matching the pattern
 * in `useCollaboration`. Calling `setState` directly in an effect body triggers
 * cascading renders (and the `set-state-in-effect` lint rule).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Awareness } from "y-protocols/awareness";

import {
  setLocalCursor,
  type AwarenessUser,
  type PeerCursor,
} from "./awareness";

export interface UseCursorsResult {
  /** Publish the local user's current cursor/selection. */
  setCursor: (cursor: NonNullable<AwarenessUser["cursor"]>) => void;
  /** Clear the local cursor (on blur / close). */
  clearCursor: () => void;
  /** Every peer currently on a given card (excluding the local user). */
  peersOnCard: (cardId: string) => PeerCursor[];
  /** Every peer currently on a given column (excluding the local user). */
  peersOnColumn: (columnId: string) => PeerCursor[];
}

/** Collect every remote peer (and its cursor) from awareness state. */
function readPeers(awareness: Awareness): PeerCursor[] {
  const localId = awareness.doc.clientID;
  const peers: PeerCursor[] = [];

  awareness.getStates().forEach((state, clientId) => {
    if (clientId === localId) return;
    const user = state?.user as AwarenessUser | undefined;
    if (!user?.userId) return;
    peers.push({
      userId: user.userId,
      name: user.name,
      color: user.color,
      cursor: user.cursor,
    });
  });

  return peers;
}

export function useCursors(awareness: Awareness | null): UseCursorsResult {
  const [peers, setPeers] = useState<PeerCursor[]>([]);

  useEffect(() => {
    let cancelled = false;
    let frame = 0;

    const schedule = (fn: () => void) => {
      frame = requestAnimationFrame(() => {
        if (!cancelled) fn();
      });
    };

    if (!awareness) {
      schedule(() => setPeers([]));
      return () => {
        cancelled = true;
        cancelAnimationFrame(frame);
      };
    }

    const publish = () => {
      const next = readPeers(awareness);
      schedule(() => setPeers(next));
    };

    awareness.on("change", publish);
    publish();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      awareness.off("change", publish);
    };
  }, [awareness]);

  const setCursor = useCallback(
    (cursor: NonNullable<AwarenessUser["cursor"]>) => {
      if (!awareness) return;
      setLocalCursor(awareness, cursor);
    },
    [awareness],
  );

  const clearCursor = useCallback(() => {
    if (!awareness) return;
    setLocalCursor(awareness, undefined);
  }, [awareness]);

  const peersOnCard = useCallback(
    (cardId: string) => peers.filter((peer) => peer.cursor?.cardId === cardId),
    [peers],
  );

  const peersOnColumn = useCallback(
    (columnId: string) =>
      peers.filter((peer) => peer.cursor?.columnId === columnId),
    [peers],
  );

  return useMemo(
    () => ({ setCursor, clearCursor, peersOnCard, peersOnColumn }),
    [setCursor, clearCursor, peersOnCard, peersOnColumn],
  );
}
