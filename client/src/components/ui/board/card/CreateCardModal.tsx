import { useEffect, useState, type FormEvent } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
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
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle || !columnId) {
      return;
    }
    onSubmit?.({ title: trimmedTitle, columnId });
  };
  const handleBackdropMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };
  const isSubmitDisabled = !title.trim() || !columnId;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={handleBackdropMouseDown}
    >
      {" "}
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-card-title"
        className="w-full max-w-lg overflow-hidden border border-neutral-800 bg-[#0b0b0b] shadow-2xl shadow-black/50"
      >
        {" "}
        {/* Header */}{" "}
        <header className="flex items-start justify-between border-b border-neutral-800 bg-[#0d0d0d] px-5 py-4">
          {" "}
          <div className="min-w-0 pr-4">
            {" "}
            <div className="mb-2 flex items-center gap-2">
              {" "}
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 bg-[#ff1f5a]"
              />{" "}
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-600">
                {" "}
                New card{" "}
              </p>{" "}
            </div>{" "}
            <h2
              id="create-card-title"
              className="text-sm font-medium tracking-tight text-neutral-100"
            >
              {" "}
              Create card{" "}
            </h2>{" "}
            <p className="mt-1 font-mono text-[10px] leading-5 text-neutral-600">
              {" "}
              Add a new card to your board.{" "}
            </p>{" "}
          </div>{" "}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close create card dialog"
            className="flex h-8 w-8 shrink-0 items-center justify-center border border-transparent text-neutral-600 transition-colors duration-150 hover:border-neutral-800 hover:bg-neutral-900 hover:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-[#ff1f5a]/50"
          >
            {" "}
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={17}
              color="currentColor"
              strokeWidth={1.5}
            />{" "}
          </button>{" "}
        </header>{" "}
        {/* Form */}{" "}
        <form onSubmit={handleSubmit}>
          {" "}
          <div className="p-5">
            {" "}
            <div className="space-y-2">
              {" "}
              <label
                htmlFor="create-card-title-input"
                className="block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-600"
              >
                {" "}
                Title{" "}
              </label>{" "}
              <input
                id="create-card-title-input"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Enter card title..."
                autoFocus
                autoComplete="off"
                maxLength={200}
                className="h-10 w-full border border-neutral-800 bg-[#080808] px-3 font-mono text-xs text-neutral-200 outline-none transition-colors duration-150 placeholder:text-neutral-700 hover:border-neutral-700 focus:border-[#ff1f5a]/60 focus:ring-1 focus:ring-[#ff1f5a]/20"
              />{" "}
              <div className="flex items-center justify-between pt-1">
                {" "}
                <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-700">
                  {" "}
                  Required{" "}
                </span>{" "}
                <span className="font-mono text-[9px] text-neutral-700">
                  {" "}
                  {title.length}/200{" "}
                </span>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          {/* Footer */}{" "}
          <footer className="flex items-center justify-between border-t border-neutral-900 bg-[#0a0a0a] px-5 py-3">
            {" "}
            <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-neutral-700">
              {" "}
              Kanban / Card{" "}
            </span>{" "}
            <div className="flex items-center gap-2">
              {" "}
              <button
                type="button"
                onClick={onClose}
                className="h-9 border border-neutral-800 px-4 font-mono text-[10px] uppercase tracking-wider text-neutral-500 transition-colors duration-150 hover:border-neutral-700 hover:bg-neutral-900 hover:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-700"
              >
                {" "}
                Cancel{" "}
              </button>{" "}
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="h-9 border border-[#ff1f5a]/40 bg-[#ff1f5a]/10 px-4 font-mono text-[10px] uppercase tracking-wider text-[#ff1f5a] transition-colors duration-150 hover:border-[#ff1f5a] hover:bg-[#ff1f5a]/15 focus:outline-none focus:ring-1 focus:ring-[#ff1f5a]/40 disabled:cursor-not-allowed disabled:border-neutral-800 disabled:bg-neutral-900 disabled:text-neutral-700"
              >
                {" "}
                Create card{" "}
              </button>{" "}
            </div>{" "}
          </footer>{" "}
        </form>{" "}
      </section>{" "}
    </div>
  );
}
