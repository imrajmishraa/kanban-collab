/**
 * Public surface of the collaboration module.
 *
 * Only the symbols the app actually imports through this barrel are re-exported.
 * The protocol/awareness/provider internals are used within the module and
 * imported directly where needed — re-exporting them here just produced dead
 * barrel exports (knip).
 */
export { useCollaboration } from "./useCollaboration";
export { buildCollaborationWsUrl } from "./buildWsUrl";
export { useBoardDoc } from "./useBoardDoc";
export { useCursors } from "./useCursors";
