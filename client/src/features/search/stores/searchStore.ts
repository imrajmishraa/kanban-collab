import { create } from "zustand";

export type SearchScope = "cards" | "boards";

interface SearchState {
  open: boolean;
  /** Which section the palette opens on. */
  initialScope: SearchScope;
  openSearch: (scope?: SearchScope) => void;
  closeSearch: () => void;
  toggleSearch: () => void;
}

export const useSearchStore = create<SearchState>()((set) => ({
  open: false,
  initialScope: "cards",
  /* Callers that want a specific section, like the workspace page's board
     search, pass it here. */
  openSearch: (scope) => set({ open: true, initialScope: scope ?? "cards" }),
  closeSearch: () => set({ open: false }),
  toggleSearch: () => set((s) => ({ open: !s.open })),
}));
