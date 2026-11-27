import { useEffect } from "react";
import { createPortal } from "react-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

interface DialogShellProps {
  title: string;
  description: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function DialogShell({
  title,
  description,
  onClose,
  children,
}: DialogShellProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-start justify-center overflow-y-auto p-4 pt-24">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-(--scrim) backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-(--hairline) bg-(--bg-root)/95 backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-200"
      >
        <div className="flex items-start justify-between gap-4 border-b border-(--hairline) px-5 py-4">
          <div>
            <h2 className="text-[14px] font-medium tracking-tight text-(--text-primary)">
              {title}
            </h2>
            <p className="mt-0.5 text-[11.5px] text-(--text-muted)">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-transparent text-(--text-muted) transition-colors duration-200 hover:border-(--hairline) hover:bg-(--bg-hover) hover:text-(--text-primary)"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={1.8} />
          </button>
        </div>

        {children}
      </div>
    </div>,
    document.body,
  );
}

/* ── Add member ─────────────────────────────────────────────────────────── */
