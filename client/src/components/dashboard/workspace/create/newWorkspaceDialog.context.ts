import { createContext, useContext } from "react";

export interface NewWorkspaceDialogContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const NewWorkspaceDialogContext =
  createContext<NewWorkspaceDialogContextValue | null>(null);

export function useNewWorkspaceDialog() {
  const ctx = useContext(NewWorkspaceDialogContext);
  if (!ctx) {
    throw new Error(
      "useNewWorkspaceDialog must be used within <NewWorkspaceDialogProvider>",
    );
  }
  return ctx;
}
