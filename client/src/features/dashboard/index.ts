/**
 * Public API of the `dashboard` feature.
 *
 * Only what code outside this folder imports. Everything else is internal:
 * use a relative path from inside the feature, and add to this list only
 * when something outside genuinely needs it.
 */
export { notificationsApi } from "./api/notificationsApi";
export { default as NotificationPreferences } from "./components/NotificationPreferences";
export { default as SidebarItem } from "./components/SidebarItem";
export { default as ActivitySection } from "./components/main/ActivitySection";
export { default as DashboardError } from "./components/main/DashboardError";
export { default as DashboardHeader } from "./components/main/DashboardHeader";
export { default as DashboardOverview } from "./components/main/DashboardOverview";
export { default as WorkspaceSection } from "./components/main/WorkspaceSection";
export { default as NotificationsPanel } from "./components/notifications/NotificationsPanel";
export { notificationKeys } from "./components/notifications/index";
export { SearchInputRow } from "./components/search/SearchInputRow";
export { SearchPreview } from "./components/search/SearchPreview";
export { SearchResults } from "./components/search/SearchResults";
export { useSearchPalette } from "./components/search/useSearchPalette";
export { default as DashboardSkeleton } from "./components/skeletons/DashboardSkeleton";
export {
  NavbarSearchIcon,
  NotificationsButton,
} from "./components/workspace/NavbarIcons";
export { default as NewWorkspaceDialog } from "./components/workspace/NewWorkspaceDialog";
export { default as SidebarNewProject } from "./components/workspace/SidebarNewProject";
export { WorkspaceSelector } from "./components/workspace/WorkspaceSelector";
export { useDashboard } from "./hooks/useDashboard";
export { usePinnedBoards } from "./stores/pinnedBoards";
export { useSidebarState } from "./stores/sidebarState";
export type { SidebarMode } from "./stores/sidebarState";
