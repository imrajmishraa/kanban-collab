import { describe, expect, it } from "vitest";

import {
  isPanelRenderable,
  panelConfig,
  panelConfigByDevice,
  percentOf,
  totalDefaultPercent,
  type PanelConfig,
  type PanelDevice,
  type PanelId,
} from "./panelConfig";

/**
 * The panel table is the contract the shell is built from.
 *
 * These assertions exist because the numbers are hand-typed in one place and read
 * by three regions: a percentage that lost its `%`, a floor that became a share,
 * or a mobile row that quietly stopped being zero would all show up as a layout
 * bug long before anyone reads this file.
 */

const PANEL_IDS: PanelId[] = ["leftPanel", "centreLayout", "rightPanel"];
const DEVICES: PanelDevice[] = ["desktop", "tablet", "mobile"];

describe("desktop config", () => {
  it("keeps the edges at 20% / 22% with pixel floors", () => {
    expect(panelConfig.leftPanel).toEqual({
      defaultSize: "20%",
      minSize: 240,
      maxSize: "28%",
      collapsible: true,
      collapsedSize: 0,
    });
    expect(panelConfig.rightPanel).toEqual({
      defaultSize: "22%",
      minSize: 320,
      maxSize: "55%",
      collapsible: true,
      collapsedSize: 0,
    });
  });

  it("gives the centre a pixel floor and no default size", () => {
    expect(panelConfig.centreLayout.minSize).toBe(420);
    expect(panelConfig.centreLayout.maxSize).toBe("70%");
    const centre: PanelConfig = panelConfig.centreLayout;

    expect(centre.defaultSize).toBeUndefined();
    expect(panelConfig.centreLayout.collapsible).toBe(false);
  });
});

describe("tablet config", () => {
  it("keeps its own tighter ceilings", () => {
    expect(panelConfigByDevice.tablet.leftPanel.maxSize).toBe("30%");
    expect(panelConfigByDevice.tablet.rightPanel.maxSize).toBe("35%");
    expect(panelConfigByDevice.tablet.centreLayout.maxSize).toBe("65%");
  });

  it("holds the same pixel floors the brief settled", () => {
    expect(panelConfigByDevice.tablet.leftPanel.minSize).toBe(200);
    expect(panelConfigByDevice.tablet.rightPanel.minSize).toBe(320);
    expect(panelConfigByDevice.tablet.centreLayout.minSize).toBe(420);
  });
});

describe("mobile config", () => {
  it("renders neither edge and hands the window to the centre", () => {
    expect(panelConfigByDevice.mobile.leftPanel.maxSize).toBe("0%");
    expect(panelConfigByDevice.mobile.rightPanel.maxSize).toBe("0%");
    expect(panelConfigByDevice.mobile.centreLayout.defaultSize).toBe("100%");

    expect(isPanelRenderable(panelConfigByDevice.mobile.leftPanel)).toBe(false);
    expect(isPanelRenderable(panelConfigByDevice.mobile.rightPanel)).toBe(
      false,
    );
    expect(isPanelRenderable(panelConfigByDevice.mobile.centreLayout)).toBe(
      true,
    );
  });
});

describe("every device", () => {
  it.each(DEVICES)("%s: carries all three panels", (device) => {
    expect(Object.keys(panelConfigByDevice[device]).sort()).toEqual(
      [...PANEL_IDS].sort(),
    );
  });

  it.each(DEVICES)(
    "%s: floors are pixels and ceilings are percentages",
    (device) => {
      for (const id of PANEL_IDS) {
        const config = panelConfigByDevice[device][id];

        expect(Number.isInteger(config.minSize)).toBe(true);
        expect(config.minSize).toBeGreaterThanOrEqual(0);
        expect(config.maxSize).toMatch(/^\d+(\.\d+)?%$/);
      }
    },
  );

  it.each(DEVICES)(
    "%s: a panel with no ceiling is not collapsible",
    (device) => {
      for (const id of PANEL_IDS) {
        const config = panelConfigByDevice[device][id];

        if (!isPanelRenderable(config)) {
          expect(config.collapsible).toBe(false);
        }
      }
    },
  );

  /* Mobile is the exception that proves it: there the centre is the only panel
     left, so it is the one device where a default belongs on it. */
  it.each(["desktop", "tablet"] as const)(
    "%s: the centre carries no default size",
    (device) => {
      const centre: PanelConfig = panelConfigByDevice[device].centreLayout;

      expect(centre.defaultSize).toBeUndefined();
    },
  );

  it.each(["desktop", "tablet"] as const)(
    "%s: the edges' defaults leave the centre room",
    (device) => {
      expect(totalDefaultPercent(device)).toBeLessThan(100);
    },
  );
});

describe("percentOf", () => {
  it("reads the number out of a percentage string", () => {
    expect(percentOf("20%")).toBe(20);
    expect(percentOf("27.5%")).toBe(27.5);
  });

  it("treats a missing size as nothing at all", () => {
    expect(percentOf(undefined)).toBe(0);
  });
});

describe("totalDefaultPercent", () => {
  it("adds up the edges, because the centre has no default", () => {
    expect(totalDefaultPercent("desktop")).toBe(42);
    expect(totalDefaultPercent("tablet")).toBe(47);
    /* The only panel left on a phone is the centre, so its 100% is the total. */
    expect(totalDefaultPercent("mobile")).toBe(100);
  });
});

describe("isPanelRenderable", () => {
  it("is true wherever the panel has a ceiling to grow into", () => {
    expect(isPanelRenderable(panelConfig.leftPanel)).toBe(true);
    expect(isPanelRenderable(panelConfig.rightPanel)).toBe(true);
    expect(isPanelRenderable(panelConfig.centreLayout)).toBe(true);
  });
});
