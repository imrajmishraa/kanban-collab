/**
 * Which gestures open a bubble.
 *
 * A tooltip usually has one trigger, but "hover to peek, click to pin" is a real pair: the
 * hover gives a preview and the click says "keep this here". So the prop takes a list, and the
 * question "does this open on hover" becomes a lookup rather than a comparison.
 */
export type TooltipTrigger = "hover" | "focus" | "click" | "manual";

export interface ResolvedTriggers {
  hover: boolean;
  focus: boolean;
  click: boolean;
  manual: boolean;
}

/**
 * `canHover` is the device's answer, not the caller's: a phone has no hover, so a `"hover"`
 * trigger there is dead weight and the bubble would only ever open from a tap.
 */
export function resolveTriggers(
  trigger: TooltipTrigger | TooltipTrigger[] | undefined,
  canHover: boolean,
): ResolvedTriggers {
  const modes = new Set<TooltipTrigger>(
    trigger === undefined
      ? ["hover"]
      : Array.isArray(trigger)
        ? trigger
        : [trigger],
  );

  return {
    hover: modes.has("hover") && canHover,
    focus: modes.has("focus") || modes.has("hover"),
    click: modes.has("click"),
    manual: modes.has("manual"),
  };
}
