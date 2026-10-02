// Top-level collaboration protocol message types.

export const CollaborationMessage = {
  Sync: 0,
  Awareness: 1,
} as const;

export type CollaborationMessageType =
  (typeof CollaborationMessage)[keyof typeof CollaborationMessage];
