import { computeRail, RAIL } from "@/features/dashboard";
import { SPIKE, SPIKE_DELTAS } from "@/lib/layoutRules";
import { TABLET } from "@/lib/tabletLayout";
import { defaultModeForViewport } from "@/stores/rightPanel";

/**
 * Which of the settled deltas the app still has not adopted.
 *
 * `SPIKE_DELTAS` is the catalogue of every number the spike and the app may
 * disagree on; this is the live half. Comparing the two beats a hand-edited
 * "pending" list — the moment `RAIL.MIN` becomes 200 the C1 row has to vanish by
 * itself, or the page goes on claiming a difference that no longer exists.
 */
const stillDiffers = (rule: string): boolean => {
  switch (rule) {
    case "C1":
      return RAIL.MIN !== SPIKE.desktop.rail.min;

    case "B3":
      /* The preview is only reachable through the layout machine, so ask it what a
         pointer on a collapsed rail at 900px actually renders at. */
      return (
        computeRail({
          mode: "collapsed",
          hovering: true,
          width: RAIL.DEFAULT,
          viewportWidth: 900,
        }).railWidth !== SPIKE.tablet.rail.preview
      );

    case "E6":
      return TABLET.RAIL_MAX !== SPIKE.tablet.rail.max;

    case "E7":
      return defaultModeForViewport(900) !== "off";

    default:
      return true;
  }
};

export const pendingDeltas = () =>
  SPIKE_DELTAS.filter((delta) => stillDiffers(delta.rule));
