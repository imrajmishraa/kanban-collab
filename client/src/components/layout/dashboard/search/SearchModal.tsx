import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons";

import { searchApi } from "@/api/dashboard/searchApi";
import { useSearchStore } from "@/stores/searchStore";
import { useBoardsStore } from "@/stores/boards";

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad|iPod/.test(navigator.platform);

/**
 * Debounce a value. The state update happens inside the timer callback (not
 * synchronously in the effect body), which keeps it clear of the React
 * Compiler `set-state-in-effect` rule.
 */
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function SearchModal() {
  const open = useSearchStore((s) => s.open);
  const openSearch = useSearchStore((s) => s.openSearch);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && !e.shiftKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openSearch]);

  if (!open) return null;
  return <SearchModalContent />;
}

function SearchModalContent() {
  const closeSearch = useSearchStore((s) => s.closeSearch);

  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const lastBoardId = useBoardsStore((s) => s.lastBoardId);
  const debouncedQuery = useDebouncedValue(query, 250);

  const results = useQuery({
    queryKey: ["card-search", lastBoardId, debouncedQuery],
    queryFn: () => searchApi.searchCards(lastBoardId!, debouncedQuery.trim()),
    enabled: Boolean(lastBoardId) && debouncedQuery.trim().length >= 2,
  });

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeSearch]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-100">
      <div
        aria-hidden="true"
        onClick={closeSearch}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className="relative mx-auto mt-[18vh] w-[min(720px,calc(100vw-2rem))]"
      >
        <div
          className="
            flex h-14 items-center gap-3 rounded-2xl
            border border-white/10 bg-(--bg-elevated)
            shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8),0_4px_12px_-2px_rgba(0,0,0,0.5)]
            px-4
          "
        >
          <HugeiconsIcon
            icon={Search01Icon}
            size={18}
            strokeWidth={1.6}
            className="shrink-0 text-(--text-muted)"
          />

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search boards, cards, workspaces…"
            className="
              min-w-0 flex-1 bg-transparent
              font-mono text-[14px] text-(--text-primary)
              placeholder:text-(--text-muted)
              outline-none ring-0 focus:outline-none focus:ring-0
            "
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label="Clear"
              className="shrink-0 rounded p-1 text-(--text-muted) transition-colors hover:bg-white/6 hover:text-(--text-primary)"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={13} strokeWidth={1.8} />
            </button>
          )}

          <span aria-hidden="true" className="h-5 w-px bg-white/10" />

          <button
            type="button"
            onClick={closeSearch}
            aria-label="Close search"
            className="shrink-0 rounded-full p-1.5 text-(--text-muted) transition-colors hover:bg-white/8 hover:text-(--text-primary)"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={1.8} />
          </button>
        </div>

        {query.trim().length > 0 && (
          <div className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-(--bg-elevated) shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)]">
            {!lastBoardId ? (
              <p className="px-4 py-5 font-mono text-[12px] text-(--text-muted)">
                Open a board first — search runs within the active board.
              </p>
            ) : debouncedQuery.trim().length < 2 ? (
              <p className="px-4 py-5 font-mono text-[12px] text-(--text-muted)">
                Keep typing…
              </p>
            ) : results.isLoading ? (
              <p className="px-4 py-5 font-mono text-[12px] text-(--text-muted)">
                Searching…
              </p>
            ) : results.isError ? (
              <p className="px-4 py-5 font-mono text-[12px] text-(--danger)">
                Search failed. Please try again.
              </p>
            ) : (results.data?.length ?? 0) === 0 ? (
              <p className="px-4 py-5 font-mono text-[12px] text-(--text-muted)">
                No cards match “{debouncedQuery.trim()}”.
              </p>
            ) : (
              <ul className="max-h-[50vh] overflow-y-auto py-1">
                {results.data?.map((card) => (
                  <li key={card.id}>
                    <button
                      type="button"
                      onClick={() => {
                        closeSearch();
                        if (lastBoardId) navigate(`/board/${lastBoardId}`);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/6"
                    >
                      <HugeiconsIcon
                        icon={Search01Icon}
                        size={14}
                        strokeWidth={1.6}
                        className="shrink-0 text-(--text-muted)"
                      />
                      <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-(--text-primary)">
                        {card.title}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
