export {
  CollaborationMessage,
  encodeCollaborationMessage,
  decodeCollaborationMessage,
  encodeSyncStep1,
  encodeSyncUpdate,
  applySyncMessage,
} from "./syncProtocol";

export type { CollaborationMessageType } from "./syncProtocol";

export {
  createAwareness,
  setLocalUser,
  encodeAwarenessUpdate,
  encodeFullAwarenessUpdate,
  applyAwarenessUpdate,
  getRemotePeers,
  removeLocalAwareness,
  subscribeToPeers,
} from "./awareness";

export type { AwarenessUser, AwarenessChangeHandler } from "./awareness";

export { YjsProvider } from "./YjsProvider";
export type { ProviderStatus, YjsProviderOptions } from "./YjsProvider";

export { useCollaboration } from "./useCollaboration";
export type {
  CollabStatus,
  UseCollaborationOptions,
  UseCollaborationResult,
} from "./useCollaboration";

export { buildCollaborationWsUrl, colorFromUserId } from "./buildWsUrl";
