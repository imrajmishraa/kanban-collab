/**
 * Public API of the `boards` feature.
 *
 * Only what code outside this folder imports. Everything else is internal:
 * use a relative path from inside the feature, and add to this list only
 * when something outside genuinely needs it.
 */
export { attachmentsApi } from "./api/attachmentsApi";
export { boardApi } from "./api/boardApi";
export { commentsApi } from "./api/commentsApi";
export { cardApi } from "./api/cardApi";
export { columnApi } from "./api/columnAPI";
export { avatarColor, initials, ui, formatRelative } from "./board.helpers";
export type { BoardMember } from "./board.helpers";
export { default as BoardColumn } from "./components/BoardColumn";
export { default as BoardSkeleton } from "./components/BoardSkeleton";
export { BoardMessage, BoardShell } from "./components/BoardStates";
export { default as BoardView } from "./components/BoardView";
export { default as WorkspaceOverview } from "./components/WorkspaceOverview";
export { default as CardAttachmentsDialog } from "./components/cards/CardAttachmentsDialog";
export { default as BoardCardItem } from "./components/BoardCardItem";
export { default as CardCommentsDialog } from "./components/cards/CardCommentsDialog";
export { default as CardEditorContent } from "./components/cards/CardEditorContent";
export { default as CardEditorMeta } from "./components/cards/CardEditorMeta";
export { default as CardComposer } from "./components/cards/CardComposer";
export { useActiveWorkspaceMembers } from "./hooks/useActiveWorkspaceMembers";
export { useBoardForPage } from "./hooks/useBoardForPage";
export { useBoardMutations } from "./hooks/useBoardMutations";
export { useWorkspaceBoards } from "./hooks/useWorkspaceBoards";
export { useBoardsStore } from "./stores/boards";
export { groupBoardsByTime } from "./utils/boardGrouping";

// validation
export { createColumnSchema } from "./validations/column.validator";
export { updateColumnSchema } from "./validations/column.validator";
export { createBoardSchema } from "./validations/board.validator";
export { updateBoardSchema } from "./validations/board.validator";
export { shareBoardSchema } from "./validations/board.validator";
export { createCardSchema } from "./validations/card.validator";
export { updateCardSchema } from "./validations/card.validator";
export { moveCardSchema } from "./validations/card.validator";

// helpers
export {
  formatDue,
  isOverdue,
  labelColor,
  type SortKey,
  type ViewMode,
} from "./board.helpers";

// components
export { default as CardPalette } from "./components/cards/CardPalette";
export { default as BoardHeader } from "./components/BoardHeader";
export { default as BoardListView } from "./components/BoardListView";
export { default as BoardOverview } from "./components/BoardOverview";
export { default as BoardToolbar } from "./components/BoardToolbar";
export { default as BoardPresence } from "./components/BoardPresence";
export { default as BoardActivityPanel } from "./components/BoardActivityPanel";
export { default as CardAttachments } from "./components/cards/CardAttachments";
export { default as CardComments } from "./components/cards/CardComments";
export { default as CommentReplies } from "./components/cards/CommentReplies";
export { default as CommentVotes } from "./components/cards/CommentVotes";
