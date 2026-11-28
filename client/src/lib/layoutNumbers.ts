/**
 * Numbers both halves of the layout need.
 *
 * They live in their own module so `panelMetrics` and `tabletLayout` can share them without
 * importing each other: `tabletLayout` needs the board's floor, and `panelMetrics` is what
 * defines the rest of the column's numbers.
 */
export const PAGE_MIN = 420;
