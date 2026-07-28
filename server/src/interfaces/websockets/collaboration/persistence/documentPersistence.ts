import type * as Y from "yjs";

/**
 * Defines the persistence contract for collaborative Yjs documents.
 * Implementations may store state in MongoDB, Redis, PostgreSQL, S3, etc.
 */
export interface DocumentPersistence {

    // Loads persisted state into a newly created document.
  bindState(documentName: string, document: Y.Doc): Promise<void>;

  //   Persists the latest document state.
  writeState(documentName: string, document: Y.Doc): Promise<void>;
}
