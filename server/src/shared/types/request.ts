import type { IncomingMessage } from "http";

export interface AuthenticatedRequest extends IncomingMessage {
  pathname?: string;
  userId?: string;
  boardId?: string;
}