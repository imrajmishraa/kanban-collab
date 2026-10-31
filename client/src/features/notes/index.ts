/**
 * Public API of the `notes` feature.
 *
 * Only what code outside this folder imports. Everything else is internal:
 * use a relative path from inside the feature, and add to this list only
 * when something outside genuinely needs it.
 */
export { notesApi } from "./api/notesApi";
