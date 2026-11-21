export interface SearchResultCard {
  id: string;
  title: string;
  columnId: string;
}

/**
 * `GET /cards/search` takes `q`, not `query`.
 *
 * The palette sent `query` for a while, and the server only ever read `q` — so
 * every card search answered 400 and the "Cards" scope of the palette was
 * permanently empty. The parameter name is part of the contract; this type is
 * where it is written down.
 */
export interface SearchCardsParams {
  boardId: string;
  q: string;
  /** Server default 20, capped at 50. */
  limit?: number;
}

/** The server answers `{ cards }` — it was never `{ results, total }`. */
export interface SearchCardsResponse {
  cards: SearchResultCard[];
}
