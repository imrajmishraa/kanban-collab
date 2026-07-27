declare module "y-websocket/bin/utils" {
  import type { IncomingMessage } from "http";

  import type WebSocket from "ws";
  import type * as Y from "yjs";

  export interface Persistence {
    bindState(docName: string, ydoc: Y.Doc): Promise<void>;
    writeState(docName: string, ydoc: Y.Doc): Promise<void>;
  }

  export interface SetupWSConnectionOptions {
    /**
     * Optional document name.
     * If omitted, y-websocket derives it from the request URL.
     */
    docName?: string;

    /**
     * Enable or disable Yjs garbage collection.
     * Defaults to true.
     */
    gc?: boolean;
  }

  /**
   * Registers a persistence provider for Yjs documents.
   */
  export function setPersistence(persistence: Persistence): void;

  /**
   * Initializes a Yjs WebSocket connection.
   */
  export function setupWSConnection(
    conn: WebSocket,
    req: IncomingMessage,
    opts?: SetupWSConnectionOptions,
  ): void;
}
