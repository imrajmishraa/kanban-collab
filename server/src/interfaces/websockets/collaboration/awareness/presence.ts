import type {
  CursorPosition,
  Selection,
  UserPresence,
} from "./types";

export class PresenceManager {
  // boardId -> (userId -> UserPresence)
  private readonly boards = new Map<
    string,
    Map<string, UserPresence>
  >();

  // Adds or updates a user's presence within a board.
  public join(
    boardId: string,
    presence: UserPresence,
  ): void {
    let users = this.boards.get(boardId);

    if (!users) {
      users = new Map();
      this.boards.set(boardId, users);
    }

    users.set(presence.userId, {
      ...presence,
      boardId,
      lastSeen: new Date(),
    });
  }

  // Removes a user from a board.
  public leave(
    boardId: string,
    userId: string,
  ): void {
    const users = this.boards.get(boardId);

    if (!users) {
      return;
    }

    users.delete(userId);

    if (users.size === 0) {
      this.boards.delete(boardId);
    }
  }

  // Updates a user's cursor position.
  public updateCursor(
    boardId: string,
    userId: string,
    cursor: CursorPosition,
  ): void {
    const presence = this.getPresence(boardId, userId);

    if (!presence) {
      return;
    }

    presence.cursor = cursor;
    presence.lastSeen = new Date();
  }

  // Updates a user's current selection.
  public updateSelection(
    boardId: string,
    userId: string,
    selection: Selection,
  ): void {
    const presence = this.getPresence(boardId, userId);

    if (!presence) {
      return;
    }

    presence.selection = selection;
    presence.lastSeen = new Date();
  }

  // Refreshes the user's last activity timestamp.
  public touch(
    boardId: string,
    userId: string,
  ): void {
    const presence = this.getPresence(boardId, userId);

    if (!presence) {
      return;
    }

    presence.lastSeen = new Date();
  }

  // Returns one user's presence.
  public getPresence(
    boardId: string,
    userId: string,
  ): UserPresence | undefined {
    return this.boards
      .get(boardId)
      ?.get(userId);
  }

   // Returns all users currently connected to a board.
  public getUsers(
    boardId: string,
  ): readonly UserPresence[] {
    const users = this.boards.get(boardId);

    if (!users) {
      return [];
    }

    return [...users.values()];
  }

  // Returns the number of connected users in a board.
  public getUserCount(
    boardId: string,
  ): number {
    return this.boards.get(boardId)?.size ?? 0;
  }

  //  Returns whether a board has any connected users.
  public hasUsers(
    boardId: string,
  ): boolean {
    return this.getUserCount(boardId) > 0;
  }

  // Removes every user from a board.
  public clearBoard(
    boardId: string,
  ): void {
    this.boards.delete(boardId);
  }

  // Clears all presence state.
  public clear(): void {
    this.boards.clear();
  }

  // Returns the number of active boards.
  public getBoardCount(): number {
    return this.boards.size;
  }

  // Returns the total number of connected users.
  public getTotalUserCount(): number {
    let total = 0;

    for (const users of this.boards.values()) {
      total += users.size;
    }

    return total;
  }
}

// Singleton instance shared by the collaboration layer.
export const presenceManager = new PresenceManager();
