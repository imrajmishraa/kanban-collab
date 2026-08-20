import { Search, X } from "lucide-react";

interface BoardSearchEmptyStateProps {
  query: string;
  onClear: () => void;
}

export default function BoardSearchEmptyState({
  query,
  onClear,
}: BoardSearchEmptyStateProps) {
  return (
    <section
      aria-label="No search results"
      className="flex h-full min-h-70 items-center justify-center p-6"
    >
      <div className="flex max-w-md flex-col items-center text-center">
        <div
          className="mb-5 flex h-11 w-11 items-center justify-center border border-neutral-800 bg-[#0b0b0b] text-neutral-600"
          aria-hidden="true"
        >
          <Search size={18} />
        </div>

        <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-neutral-300">
          No cards found
        </h2>

        <p className="mt-2 font-mono text-[11px] leading-5 text-neutral-600">
          No cards match{" "}
          <span className="text-neutral-400">&quot;{query}&quot;</span>. Try a
          different search term.
        </p>

        <button
          type="button"
          onClick={onClear}
          className="mt-5 inline-flex h-8 items-center gap-2 border border-neutral-800 px-3 font-mono text-[11px] text-neutral-500 transition hover:border-neutral-700 hover:bg-neutral-900 hover:text-neutral-200"
        >
          <X size={13} />
          Clear search
        </button>
      </div>
    </section>
  );
}
