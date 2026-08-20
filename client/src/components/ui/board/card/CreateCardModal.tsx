import { useEffect, useState } from "react";
import { X } from "lucide-react";

export interface CreateCardFormData {
  title: string;
  columnId: string;
}

interface CreateCardModalProps {
  open: boolean;
  columnId?: string;
  onClose: () => void;
  onSubmit?: (data: CreateCardFormData) => void;
}

export default function CreateCardModal({
  open,
  columnId = "",
  onClose,
  onSubmit,
}: CreateCardModalProps) {
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!open) {
      setTitle("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    onSubmit?.({
      title: trimmedTitle,
      columnId,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-card-title"
    >
      <div className="w-full max-w-lg border border-neutral-800 bg-[#0b0b0b] shadow-2xl">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
          <div>
            <h2
              id="create-card-title"
              className="font-mono text-xs font-semibold uppercase tracking-wider text-neutral-200"
            >
              Create card
            </h2>

            <p className="mt-1 font-mono text-[10px] text-neutral-600">
              Add a new card to your board.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close create card dialog"
            className="flex h-8 w-8 items-center justify-center text-neutral-600 transition hover:bg-neutral-900 hover:text-neutral-300"
          >
            <X size={16} />
          </button>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-4">
            <div className="space-y-2">
              <label
                htmlFor="create-card-title-input"
                className="font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500"
              >
                Title
              </label>

              <input
                id="create-card-title-input"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Enter card title..."
                autoFocus
                className="h-10 w-full border border-neutral-800 bg-[#080808] px-3 font-mono text-xs text-neutral-200 outline-none transition placeholder:text-neutral-700 focus:border-neutral-600"
              />
            </div>
          </div>

          {/* Footer */}
          <footer className="flex items-center justify-end gap-2 border-t border-neutral-800 px-4 py-3">
            <button
              type="button"
              onClick={onClose}
              className="h-9 border border-neutral-800 px-4 font-mono text-xs text-neutral-500 transition hover:border-neutral-700 hover:bg-neutral-900 hover:text-neutral-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!title.trim() || !columnId}
              className="h-9 border border-[#ff1f5a]/40 bg-[#ff1f5a]/10 px-4 font-mono text-xs text-[#ff1f5a] transition hover:border-[#ff1f5a] hover:bg-[#ff1f5a]/15 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Create card
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
