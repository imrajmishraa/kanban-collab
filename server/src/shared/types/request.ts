import type { IncomingMessage } from "node:http";

export interface WsUser {
  userId: string;
  email: string;
  fullName: string;
}

export interface AuthenticatedRequest extends IncomingMessage {
  pathname: string;
  query: URLSearchParams;
  ip?: string;
  userAgent?: string;
  token?: string;
  user?: WsUser;
  userId?: string;
  boardId?: string;
}
