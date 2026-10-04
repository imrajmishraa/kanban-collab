import { useEffect, useRef, useState } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

interface CardComposerProps {
  onSubmit: (title: string) => void;
  onCancel: () => void;
}

/** Inline "add card" composer shown at the foot of a column. */
export default function CardComposer({
  onSubmit,
  onCancel,
}: CardComposerProps) {
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setTitle("");
  };

  return (
    <div className="rounded-lg border border-(--brand-border) bg-white/6 p-2">
      <textarea
        ref={inputRef}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
          if (event.key === "Escape") onCancel();
        }}
        rows={2}
        placeholder="Card title…"
        className="w-full resize-none bg-transparent font-mono text-[12px] text-(--text-primary) outline-none placeholder:text-(--text-muted)"
      />

      <div className="mt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={submit}
          className="rounded-full border border-(--brand-border) bg-(--brand-muted) px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-(--brand-hover) transition-colors duration-200 hover:bg-[rgba(255,107,53,0.18)] hover:text-(--text-primary)"
        >
          Add
        </button>

        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel"
          className="flex size-7 items-center justify-center rounded-full text-(--text-muted) transition-colors hover:text-(--text-primary)"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={1.6} />
        </button>
      </div>
    </div>
  );
}
