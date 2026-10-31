/**
 * Public API of the `workspaces` feature.
 *
 * Only what code outside this folder imports. Everything else is internal:
 * use a relative path from inside the feature, and add to this list only
 * when something outside genuinely needs it.
 */
export { workspaceApi } from "./api/workspaceApi";
export { BoardCard } from "./components/BoardCard";
export { BoardSearch } from "./components/BoardSearch";
export {
  AddColumnDialog,
  DeleteBoardDialog,
  EditBoardDialog,
  EditColumnDialog,
} from "./components/board-dialogs";
export {
  AddMemberDialog,
  CreateBoardDialog,
  DialogShell,
  EditWorkspaceDialog,
  WorkspaceAvatarDialog,
} from "./components/workspace-dialogs";
export { useStarredWorkspaces } from "./stores/starredWorkspaces";
export { useWorkspaceSwitcher } from "./stores/workspaceSwitcher";
export {
  createWorkspaceSchema,
  slugify,
} from "./validations/workspace.validator";
export type { CreateWorkspaceInput } from "./validations/workspace.validator";
