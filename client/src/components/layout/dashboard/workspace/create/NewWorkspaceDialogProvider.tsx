import { useCallback, useMemo, useState, type ReactNode } from "react";

import { NewWorkspaceDialogContext } from "./newWorkspaceDialog.context";
import NewWorkspaceDialog from "./NewWorkspaceDialog";

export function NewWorkspaceDialogProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);

  return (
    <NewWorkspaceDialogContext.Provider value={value}>
      {children}
      {isOpen && <NewWorkspaceDialog onClose={close} />}
    </NewWorkspaceDialogContext.Provider>
  );
}
