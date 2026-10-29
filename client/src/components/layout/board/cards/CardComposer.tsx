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
        className="w-full resize-none bg-transparent text-[12px] text-neutral-100 outline-hidden placeholder:text-neutral-500"
      />

      <div className="mt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={submit}
          className="rounded-md border border-orange-50/20 bg-white/4 px-3 py-1.5 text-[10px] uppercase tracking-wider text-neutral-300 transition-colors duration-200 hover:border-orange-50/35 hover:text-neutral-100"
        >
          Add
        </button>

        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel"
          className="flex size-7 items-center justify-center rounded-full text-neutral-500 transition-colors hover:text-neutral-100"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={1.6} />
        </button>
      </div>
    </div>
  );
}
