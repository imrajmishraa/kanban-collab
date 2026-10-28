import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { DashboardSquare02Icon, Note01Icon } from "@hugeicons/core-free-icons";

import { searchApi } from "@/api/dashboard/searchApi";
import { useBoardsStore } from "@/stores/boards";
import { useSearchStore } from "@/stores/searchStore";

import { formatDay } from "./formatDay";
import type { PaletteRow, Scope } from "./types";

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

/**
 * All palette state and behaviour in one place: the query, the scope, the rows
 * for either scope, the highlighted row, and the document-level keys.
 *
 * Kept out of the components so each of them stays presentational.
 */
export function useSearchPalette() {
  const closeSearch = useSearchStore((s) => s.closeSearch);
  const navigate = useNavigate();

  const lastBoardId = useBoardsStore((s) => s.lastBoardId);
  const boards = useBoardsStore((s) => s.boards);

  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<Scope>("cards");
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = useDebouncedValue(query, 250).trim();

  const cardResults = useQuery({
    queryKey: ["card-search", lastBoardId, trimmed],
    queryFn: () =>
      searchApi.searchCards({ boardId: lastBoardId!, query: trimmed }),
    enabled: Boolean(lastBoardId) && trimmed.length >= 2,
  });

  const activeBoard = boards.find((board) => board.id === lastBoardId);

  /** Boards already live in the store, so this scope needs no request. */
  const boardRows = useMemo<PaletteRow[]>(() => {
    const needle = trimmed.toLowerCase();

    return boards
      .filter((board) =>
        needle.length === 0
          ? true
          : board.name.toLowerCase().includes(needle) ||
            board.workspaceName.toLowerCase().includes(needle),
      )
      .map((board) => ({
        key: `board-${board.id}`,
        title: board.name,
        meta: formatDay(board.updatedAt),
        boardId: board.id,
        icon: DashboardSquare02Icon,
      }));
  }, [boards, trimmed]);

  const cardRows = useMemo<PaletteRow[]>(
    () =>
      (cardResults.data?.results ?? []).map((card) => ({
        key: `card-${card.id}`,
        title: card.title,
        meta: activeBoard?.name,
        boardId: lastBoardId ?? "",
        icon: Note01Icon,
      })),
    [cardResults.data, activeBoard, lastBoardId],
  );

  const rows = scope === "cards" ? cardRows : boardRows;

  /**
   * Reset the highlight whenever the visible set changes.
   *
   * Done during render rather than in an effect: an effect body calling
   * setState schedules a second pass for something React can resolve in the
   * same one, and `react-hooks/set-state-in-effect` flags it.
   */
  const signature = `${scope}::${trimmed}`;
  const [lastSignature, setLastSignature] = useState(signature);

  if (signature !== lastSignature) {
    setLastSignature(signature);
    setActiveIndex(0);
  }

  const active = rows[activeIndex];

  const openRow = useCallback(
    (row: PaletteRow) => {
      closeSearch();
      if (row.boardId) navigate(`/boards/${row.boardId}`);
    },
    [closeSearch, navigate],
  );

  /* Focus the field once the palette has mounted. */
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(timer);
  }, []);

  /* Escape closes, arrows move the highlight, Enter opens. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSearch();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((i) => (rows.length === 0 ? 0 : (i + 1) % rows.length));
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((i) =>
          rows.length === 0 ? 0 : (i - 1 + rows.length) % rows.length,
        );
        return;
      }

      if (event.key === "Enter") {
        const row = rows[activeIndex];
        if (!row) return;
        event.preventDefault();
        openRow(row);
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [rows, activeIndex, openRow, closeSearch]);

  return {
    query,
    setQuery,
    scope,
    setScope,
    trimmed,
    rows,
    active,
    activeIndex,
    setActiveIndex,
    openRow,
    inputRef,
    hasActiveBoard: Boolean(lastBoardId),
    lastBoardId,
    isSearching: cardResults.isLoading,
    isSearchError: cardResults.isError,
    clearQuery: () => {
      setQuery("");
      inputRef.current?.focus();
    },
  };
}
