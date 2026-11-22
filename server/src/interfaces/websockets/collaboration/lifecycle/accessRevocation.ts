import { Types } from "mongoose";

import {
  BoardModel,
  WorkspaceModel,
} from "../../../../infrastructure/db/mongoose/schemas";
import { websocketLogger } from "../../../../infrastructure/logging/childLogger";
import { WS_CLOSE_CODE } from "../../../../shared/constants/websocket";

import { connectionRegistry } from "./connectionRegistry";

/**
 * Close the live sockets a user holds on one workspace's boards.
 *
 * Access is checked once, at the WebSocket upgrade (`middlewares/authorize`).
 * Nothing re-checked it afterwards, so a member who was removed — or demoted to
 * `guest` — kept a socket that had already been authorised, and with it a live
 * document, the presence list and every remote update. Removing somebody from a
 * workspace has to mean their session on it ends now, not at their next reload.
 *
 * The socket is closed with `4003` (FORBIDDEN) rather than dropped, so the client
 * can tell "you lost access" apart from "the network blinked" and stop
 * reconnecting. Any later upgrade attempt is refused by `authorize` itself.
 *
 * Failures are logged, never thrown: the membership change has already been
 * written, and an unreachable registry must not turn that into a 500. The stale
 * socket then lives until it closes on its own.
 */
/**
 * Removal ends the session; a role change only changes what it may do.
 *
 * Both used to close with `FORBIDDEN`, which the client treats as terminal — so
 * a promoted or demoted member lost live editing until they reloaded, with no
 * explanation, while still being entitled to the board.
 */
function closeCodeFor(reason: AccessRevocationReason): number {
  return reason === "role_changed" || reason === "board_made_private"
    ? WS_CLOSE_CODE.ACCESS_CHANGED
    : WS_CLOSE_CODE.FORBIDDEN;
}

export type AccessRevocationReason =
  "member_removed" | "member_left" | "role_changed" | "board_made_private";

export async function revokeWorkspaceSockets(
  userId: string,
  workspaceId: string,
  reason: AccessRevocationReason,
): Promise<number> {
  try {
    /* The registry indexes by board, not by workspace, so the board ids are the
       translation step. One query per membership change, not per socket. */
    const boards = await BoardModel.find({
      workspaceId: new Types.ObjectId(workspaceId),
    })
      .select("_id")
      .lean();

    if (boards.length === 0) {
      return 0;
    }

    const boardIds = new Set(boards.map((board) => board._id.toString()));

    const revoked = connectionRegistry
      .getUserConnections(userId)
      .filter((connection) => boardIds.has(connection.boardId));

    for (const connection of revoked) {
      try {
        connection.socket.close(closeCodeFor(reason), reason);
      } catch (error) {
        websocketLogger.warn(
          {
            err: error,
            userId,
            boardId: connection.boardId,
            connectionId: connection.id,
          },
          "Failed to close a revoked WebSocket connection.",
        );
      }
    }

    if (revoked.length > 0) {
      websocketLogger.info(
        {
          userId,
          workspaceId,
          reason,
          closedConnections: revoked.length,
        },
        "Closed WebSocket connections after an access change.",
      );
    }

    return revoked.length;
  } catch (error) {
    websocketLogger.error(
      { err: error, userId, workspaceId, reason },
      "Could not revoke WebSocket access for a workspace.",
    );

    return 0;
  }
}

/**
 * Close the guests' sockets on a board that has just become `private`.
 *
 * The same rule as above, reached from the other side: access is decided at the
 * upgrade, and a board's visibility can change while somebody is watching it. A
 * guest who was legitimately on a `workspace` board keeps the socket when an
 * owner flips it to `private` — and the CRDT write path has no guard of its own,
 * so "keeps the socket" means "can keep editing a board they can no longer
 * read". Closing is what makes the new visibility true for them.
 *
 * Only guests are closed: every other role may read a private board.
 */
export async function revokeGuestSocketsOnBoard(
  boardId: string,
  workspaceId: string,
): Promise<number> {
  try {
    const workspace = await WorkspaceModel.findById(workspaceId)
      .select("members")
      .lean();

    if (!workspace) {
      return 0;
    }

    const guestIds = new Set(
      workspace.members
        .filter((member) => member.role === "guest")
        .map((member) => member.userId.toString()),
    );

    if (guestIds.size === 0) {
      return 0;
    }

    const revoked = connectionRegistry
      .getBoardConnections(boardId)
      .filter((connection) => guestIds.has(connection.userId));

    for (const connection of revoked) {
      try {
        connection.socket.close(
          closeCodeFor("board_made_private"),
          "board_made_private",
        );
      } catch (error) {
        websocketLogger.warn(
          { err: error, boardId, connectionId: connection.id },
          "Failed to close a guest WebSocket connection after a visibility change.",
        );
      }
    }

    if (revoked.length > 0) {
      websocketLogger.info(
        {
          boardId,
          workspaceId,
          closedConnections: revoked.length,
        },
        "Closed guest WebSocket connections after the board became private.",
      );
    }

    return revoked.length;
  } catch (error) {
    websocketLogger.error(
      { err: error, boardId, workspaceId },
      "Could not revoke guest WebSocket access for a board.",
    );

    return 0;
  }
}
