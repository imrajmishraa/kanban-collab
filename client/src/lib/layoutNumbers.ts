/**
 * Numbers both halves of the layout need.
 *
 * They live in their own module so `panelMetrics` and `tabletLayout` can share them without
 * importing each other: `tabletLayout` needs the board's floor, and `panelMetrics` is what
 * defines the rest of the column's numbers.
 */
export const PAGE_MIN = 420;

/**
 * The app rail's floor and ceiling.
 *
 * They live here, not in `railMetrics`, because the coupling needs them too and
 * `lib` may not reach into a feature. Two copies is how the floor stayed at 240
 * in one file and 200 in the other.
 */
export const RAIL_MIN = 200;
export const RAIL_MAX = 420;
