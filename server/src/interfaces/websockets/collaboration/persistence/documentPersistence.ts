import type * as Y from "yjs";

export interface DocumentPersistence {
  bindState(documentName: string, document: Y.Doc): Promise<void>;

  writeState(documentName: string, document: Y.Doc): Promise<void>;

  shutdown(): Promise<void>;
}
