import type * as Y from "yjs";

export interface DocumentPersistence {
  bindState(documentName: string, document: Y.Doc): Promise<void>;

  /**
   * Persist the current state. Resolves `false` when the write failed, so the
   * implementation's retry loop can decide what to do next.
   */
  writeState(documentName: string, document: Y.Doc): Promise<boolean>;

  /** Cancel any pending debounce and persist immediately (used on close). */
  flush(documentName: string, document: Y.Doc): Promise<void>;

  shutdown(): Promise<void>;
}
