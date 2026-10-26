import { useEffect, useRef } from "react";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Style the confirm button as destructive (default true). */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * A small, controlled confirmation dialog (F-6).
 *
 * Destructive actions (clear column, delete column/card/board, remove member)
 * route through this so nothing is irreversible on a single click. It handles
 * Escape-to-cancel, backdrop click, and focuses the confirm button on open.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    confirmRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        className="w-full max-w-sm rounded-xl border border-white/10 bg-(--bg-surface) p-5 text-(--text-primary) shadow-xl"
      >
        <h2
          id="confirm-dialog-title"
          className="font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-(--text-primary)"
        >
          {title}
        </h2>
        <p
          id="confirm-dialog-message"
          className="mt-2 text-sm leading-relaxed text-(--text-secondary)"
        >
          {message}
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-(--text-secondary) transition-colors hover:border-white/20"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className={
              destructive
                ? "rounded-lg border border-(--danger)/40 bg-(--danger)/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-(--danger) transition-colors hover:bg-(--danger)/20"
                : "rounded-lg border border-(--brand-border) bg-(--brand)/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-(--brand) transition-colors hover:bg-(--brand)/20"
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
