declare module "y-websocket/bin/utils" {
  import type * as Y from "yjs";
  import type { IncomingMessage } from "http";
  import type WebSocket from "ws";

  export interface Persistence {
    bindState(docName: string, ydoc: Y.Doc): Promise<void>;
    writeState(docName: string, ydoc: Y.Doc): Promise<void>;
  }

  export function setPersistence(persistence: Persistence): void;

  export function setupWSConnection(
    conn: WebSocket,
    req: IncomingMessage,
    opts?: {
      docName?: string;
      gc?: boolean;
    },
  ): void;
}
