import type { Note01Icon } from "@hugeicons/core-free-icons";

/** Which slice of the app the palette is searching. */
export type Scope = "cards" | "boards";

/** One row in the results column, normalised across both scopes. */
export interface PaletteRow {
  key: string;
  title: string;
  /** Right-aligned meta: board name for cards, relative date for boards. */
  meta?: string;
  boardId: string;
  icon: typeof Note01Icon;
}
