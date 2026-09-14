declare module "y-websocket/bin/utils" {
  import type { IncomingMessage } from "node:http";
  import type WebSocket from "ws";
  import type * as Y from "yjs";

  export interface Persistence {
    provider: string;
    bindState: (docName: string, ydoc: WSSharedDoc) => Promise<void> | void;
    writeState: (docName: string, ydoc: WSSharedDoc) => Promise<void> | void;
    close?: () => void;
  }

  export interface SetupWSConnectionOptions {
    docName?: string;
    gc?: boolean;
  }

  export interface WSSharedDoc extends Y.Doc {
    name: string;
    conns: Map<WebSocket, Set<number>>;
    awareness: import("y-protocols/awareness").Awareness;
  }

  export function setPersistence(persistence: Persistence): void;

  export function setupWSConnection(
    conn: WebSocket,
    req: IncomingMessage,
    opts?: SetupWSConnectionOptions,
  ): void;

  export function getYDoc(docName: string, gc?: boolean): WSSharedDoc;

  export function closeConn(conn: WebSocket): void;

  export const docs: Map<string, WSSharedDoc>;
}
