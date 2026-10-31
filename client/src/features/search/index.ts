/**
 * Public API of the `search` feature.
 *
 * Only what code outside this folder imports. Everything else is internal:
 * use a relative path from inside the feature, and add to this list only
 * when something outside genuinely needs it.
 */
export { searchApi } from "./api/searchApi";
export { useSearchStore } from "./stores/searchStore";
