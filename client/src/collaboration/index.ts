/**
 * Public surface of the collaboration module.
 *
 * Only the two symbols the app imports through this barrel are re-exported.
 * The protocol/awareness/provider internals are used within the module and
 * imported directly where needed, so re-exporting them here just produced
 * dead barrel exports (knip).
 */
export { useCollaboration } from "./useCollaboration";
export { buildCollaborationWsUrl } from "./buildWsUrl";
export { useBoardDoc } from "./useBoardDoc";
export { useCursors } from "./useCursors";
export { createId, isBoardSeeded, readBoard } from "./boardDoc";
export { ORIGIN_LOCAL, ORIGIN_REMOTE } from "./origins";
