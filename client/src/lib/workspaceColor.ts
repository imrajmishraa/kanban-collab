/**
 * Deterministic color per workspace.
 *
 * The workspace API doesn't carry a color field, so we hash the
 * workspace id (falling back to the name) to pick a stable swatch
 * from a palette that reads well on the dark surface.
 */

export const WORKSPACE_PALETTE = [
  "#7C5CFC", // brand purple
  "#4F8EF7", // blue
  "#22D3EE", // cyan
  "#34D399", // emerald
  "#FBBF24", // amber
  "#FB923C", // orange
  "#FB7185", // rose
  "#F472B6", // pink
  "#A78BFA", // lavender
  "#60A5FA", // sky
] as const;

export const FALLBACK_WORKSPACE_COLOR = WORKSPACE_PALETTE[0];

/** FNV-1a — small, fast, good distribution for short strings. */
function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Returns a hex color from `WORKSPACE_PALETTE` for a given seed. */
export function getWorkspaceColor(seed: string | undefined): string {
  if (!seed) return FALLBACK_WORKSPACE_COLOR;
  return WORKSPACE_PALETTE[hashString(seed) % WORKSPACE_PALETTE.length];
}

/** Append alpha to a `#RRGGBB` hex. Returns the input otherwise. */
export function alpha(color: string | undefined, a: number): string {
  const c = color ?? FALLBACK_WORKSPACE_COLOR;
  if (/^#([0-9a-f]{6})$/i.test(c)) {
    const hex = Math.round(a * 255)
      .toString(16)
      .padStart(2, "0");
    return `${c}${hex}`;
  }
  return c;
}
