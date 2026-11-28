/**
 * The divider, as the old layout drew it: a hairline at rest, the link colour
 * under the pointer or the keyboard, and a grab area wider than the line.
 *
 * The line is the element's own 1px; the grab area is a pseudo-element, so it
 * costs the panes no width. Two dividers, two resting states — the column's edge
 * is drawn, the rail's is not — which is the asymmetry the old layout had and the
 * reason a single rule for both made them look like borders.
 */
export function dividerClass(open: boolean, restLine: boolean): string {
  if (!open)
    return "pointer-events-none w-0 shrink-0 overflow-hidden opacity-0";

  return [
    "relative w-px shrink-0",
    restLine ? "bg-(--hairline)" : "bg-transparent",
    "after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] after:-translate-x-1/2",
    "after:bg-gradient-to-b after:from-transparent after:via-(--hairline-strong) after:to-transparent",
    "after:opacity-0 after:transition-opacity after:duration-150",
    "motion-reduce:after:transition-none",
    "hover:after:opacity-100 focus-visible:after:opacity-100 active:after:opacity-100",
    /* A drag that leaves the divider keeps the line: `active` is not reliable once
       the pointer travels, so the shell's own flag does it too. */
    "group-data-[resizing=true]:after:opacity-100",
    "before:absolute before:inset-y-0 before:-left-1 before:w-2 before:content-['']",
  ].join(" ");
}
