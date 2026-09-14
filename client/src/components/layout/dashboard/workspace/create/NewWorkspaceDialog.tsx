import { useEffect } from "react";
import { createPortal } from "react-dom";

import NewWorkspace from "./NewWorkspace";

export default function NewWorkspaceDialog({
  onClose,
}: {
  onClose: () => void;
}) {
  /* Escape closes */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* Lock background scroll while open */
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-start justify-center overflow-y-auto p-4 pt-20">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="New workspace"
        className="relative z-10 w-full max-w-lg"
      >
        <NewWorkspace onClose={onClose} />
      </div>
    </div>,
    document.body,
  );
}
