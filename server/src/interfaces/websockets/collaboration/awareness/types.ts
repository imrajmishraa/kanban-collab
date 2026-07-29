export interface UserPresence {
    userId: string;
    fullName: string;
    boardId: string;
    color: string;
    connectedAt: Date;
    lastSeen: Date;
    cursor?: CursorPosition;
    selection?: Selection;
}

export interface CursorPosition {
    x: number;
    y: number;
}

export interface Selection {
    cardId?: string;
    columnId?: string;
}
