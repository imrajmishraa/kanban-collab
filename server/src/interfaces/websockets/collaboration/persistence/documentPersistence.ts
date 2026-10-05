import type * as Y from "yjs";

export interface DocumentPersistence {
  bindState(documentName: string, document: Y.Doc): Promise<void>;

  writeState(documentName: string, document: Y.Doc): Promise<void>;

  /** Cancel any pending debounce and persist immediately (used on close). */
  flush(documentName: string, document: Y.Doc): Promise<void>;

  shutdown(): Promise<void>;
}
