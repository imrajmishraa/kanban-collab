import { useEffect } from "react";
import { createPortal } from "react-dom";

import { useNavigate } from "react-router-dom";

import { useSearchStore } from "@/features/search/stores/searchStore";

import { SearchInputRow } from "@/features/dashboard/components/search/SearchInputRow";
import { SearchPreview } from "@/features/dashboard/components/search/SearchPreview";
import { SearchResults } from "@/features/dashboard/components/search/SearchResults";
import { useSearchPalette } from "@/features/dashboard/components/search/useSearchPalette";

/**
 * Search palette.
 *
 * Split into four pieces: this shell (portal, backdrop, global ⌘K, scroll lock
 * and focus return), `SearchInputRow`, `SearchResults` and `SearchPreview`.
 * All state lives in `useSearchPalette`.
 */
export function SearchModal() {
  const open = useSearchStore((s) => s.open);

  // The ⌘K shortcut is registered in AppLayout: this component only exists
  // while the palette is open, so a listener here could never open it.
  if (!open) return null;

  return <SearchPalette />;
}

function SearchPalette() {
  const closeSearch = useSearchStore((s) => s.closeSearch);
  const navigate = useNavigate();

  const palette = useSearchPalette();

  /* Lock page scroll while open, and hand focus back when it closes. */
  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  const openBoard = (boardId: string) => {
    closeSearch();
    navigate(`/boards/${boardId}`);
  };

  return createPortal(
    <div className="fixed inset-0 z-100">
      <div
        aria-hidden="true"
        onClick={closeSearch}
        className="absolute inset-0 bg-(--scrim) backdrop-blur-md motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className="relative mx-auto mt-[12vh] w-[min(880px,calc(100vw-2rem))] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-200"
      >
        <div className="overflow-hidden rounded-2xl border border-(--hairline) bg-(--bg-root)/95 backdrop-blur-sm">
          <SearchInputRow
            query={palette.query}
            onQueryChange={palette.setQuery}
            onClear={palette.clearQuery}
            scope={palette.scope}
            onScopeChange={palette.setScope}
            inputRef={palette.inputRef}
          />

          <div className="flex h-105">
            <SearchResults
              scope={palette.scope}
              rows={palette.rows}
              activeIndex={palette.activeIndex}
              trimmed={palette.trimmed}
              hasActiveBoard={palette.hasActiveBoard}
              lastBoardId={palette.lastBoardId}
              isSearching={palette.isSearching}
              isSearchError={palette.isSearchError}
              onHoverRow={palette.setActiveIndex}
              onOpenRow={palette.openRow}
              onOpenBoard={openBoard}
            />

            <SearchPreview
              active={palette.active}
              scope={palette.scope}
              onOpen={palette.openRow}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
