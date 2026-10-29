import { create } from "zustand";

interface WorkspaceSwitcherState {
  /**
   * Increments each time another surface asks for the navbar switcher. A
   * counter rather than a boolean, so pressing the trigger twice re-opens the
   * dropdown instead of being a no-op the second time.
   */
  openRequests: number;
  requestOpen: () => void;
}

/**
 * Lets a page open the navbar's workspace switcher.
 *
 * The dropdown state lives inside `WorkspaceSelector`, which is rendered by the
 * navbar. Rather than lift it up through the layout, the requesting component
 * bumps a counter and the selector reacts.
 */
export const useWorkspaceSwitcher = create<WorkspaceSwitcherState>((set) => ({
  openRequests: 0,
  requestOpen: () => set((state) => ({ openRequests: state.openRequests + 1 })),
}));
