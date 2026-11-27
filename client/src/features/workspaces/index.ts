/**
 * Public API of the `workspaces` feature.
 *
 * Only what code outside this folder imports. Everything else is internal:
 * use a relative path from inside the feature, and add to this list only
 * when something outside genuinely needs it.
 */
export { workspaceApi } from "./api/workspaceApi";
export { BoardCard } from "./components/BoardCard";
export { WorkspaceDeletionNotice } from "./components/WorkspaceDeletionNotice";
export { BoardSearch } from "./components/BoardSearch";
export { AddColumnDialog } from "./components/AddColumnDialog";
export { DeleteBoardDialog } from "./components/DeleteBoardDialog";
export { EditBoardDialog } from "./components/EditBoardDialog";
export { EditColumnDialog } from "./components/EditColumnDialog";
export { AddMemberDialog } from "./components/AddMemberDialog";
export { CreateBoardDialog } from "./components/CreateBoardDialog";
export { DialogShell } from "./components/DialogShell";
export { EditWorkspaceDialog } from "./components/EditWorkspaceDialog";
export { WorkspaceAvatarDialog } from "./components/WorkspaceAvatarDialog";
export { useStarredWorkspaces } from "./stores/starredWorkspaces";
export { useWorkspaceSwitcher } from "./stores/workspaceSwitcher";
export {
  createWorkspaceSchema,
  slugify,
} from "./validations/workspace.validator";
export type { CreateWorkspaceInput } from "./validations/workspace.validator";
