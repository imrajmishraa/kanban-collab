import { describe, expect, it } from "vitest";

import { PANEL } from "@/components/layout/panelMetrics";
import { dragZone, resolveDrag, type DragInput } from "./panelDragZones";

/**
 * The switch that decides which rulebook a drag is in.
 *
 * One drag moves two rails: the column first, then — once it is at its minimum — the
 * rail it has run into. Fullscreen is never a drag outcome, so it is not in here.
 */
const at = (overrides: Partial<DragInput> = {}): DragInput => ({
  rawPanelWidth: PANEL.DEFAULT,
  railWidth: 288,
  railStartWidth: 288,
  viewport: 1440,
  ceiling: 732,
  ...overrides,
});

describe("dragZone", () => {
  it("is the panel's own range between MIN and the ceiling", () => {
    expect(dragZone(at({ rawPanelWidth: PANEL.MIN }))).toBe("panel");
    expect(dragZone(at({ rawPanelWidth: 500 }))).toBe("panel");
    expect(dragZone(at({ rawPanelWidth: 700 }))).toBe("panel");
  });

  it("is 'remaining' past the ceiling, not fullscreen", () => {
    expect(dragZone(at({ rawPanelWidth: 732 + PANEL.FULL_SLOP }))).toBe(
      "panel-remaining",
    );
  });

  it("hands over to the rail below the panel's minimum", () => {
    /* 320 - 48 = 272 is where the column gives up; the overflow then eats the rail. */
    expect(dragZone(at({ rawPanelWidth: 300 }))).toBe("panel");
    expect(dragZone(at({ rawPanelWidth: 271 }))).toBe("rail");
  });

  it("collapses and then hides the rail as the drag goes further", () => {
    /* The handover is at 320 - 48 = 272; travel past it eats the rail. 288 - 72 = 216
       is under the rail's 240 minimum: collapsed. 288 - 120 = 168 is a HIDE_SLOP past
       it: hidden. */
    expect(dragZone(at({ rawPanelWidth: 200 }))).toBe("rail-collapsed");
    expect(dragZone(at({ rawPanelWidth: 152 }))).toBe("rail-hidden");
  });
});

describe("resolveDrag", () => {
  it("keeps the panel inside its ceiling", () => {
    /* 750 is still in the column's range but past the ceiling. */
    expect(resolveDrag(at({ rawPanelWidth: 750 })).panelWidth).toBe(732);
  });

  it("takes everything the rail leaves, and leaves the rail alone", () => {
    const frame = resolveDrag(at({ rawPanelWidth: 800 }));

    expect(frame.zone).toBe("panel-remaining");
    expect(frame.panelWidth).toBe(1440 - 288);
    expect(frame.railWidth).toBeNull();
  });

  it("sits the panel at MIN and gives the rail's width to the rail", () => {
    const frame = resolveDrag(at({ rawPanelWidth: 271 }));

    expect(frame.zone).toBe("rail");
    expect(frame.panelWidth).toBe(PANEL.MIN);
    /* One pixel past the handover, so the rail gives up one pixel. */
    expect(frame.railWidth).toBe(287);
  });

  it("never widens the rail past its own maximum", () => {
    /* One pixel into the rail's range costs the rail one pixel, and the clamp holds
       it at 420 rather than letting it grow past its own maximum. */
    const frame = resolveDrag(
      at({ rawPanelWidth: 271, railStartWidth: 420, railWidth: 420 }),
    );

    expect(frame.railWidth).toBeLessThanOrEqual(420);
    expect(frame.railWidth).toBe(419);
  });

  it("collapses the rail at 72, and hides it below that", () => {
    expect(resolveDrag(at({ rawPanelWidth: 200 })).railWidth).toBe(72);
    expect(resolveDrag(at({ rawPanelWidth: 152 })).railWidth).toBe(0);
  });

  it("never closes the panel by drag: the rail takes over instead", () => {
    expect(resolveDrag(at({ rawPanelWidth: 40 })).closePanel).toBe(false);
  });
});
