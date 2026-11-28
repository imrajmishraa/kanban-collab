import { beforeEach, describe, expect, it } from "vitest";

import { RAIL } from "@/lib/railMetrics";
import { PANEL } from "@/components/layout/panelMetrics";
import {
  panelStatePersist,
  readLegacyPanels,
} from "@/stores/panelStatePersist";
import { usePanelState } from "@/stores/panelState";

/**
 * One store, three slices. These tests are about the two things a store like this
 * gets wrong: a write to one slice moving another, and a reload restoring
 * something that was never a choice.
 */

const left = () => usePanelState.getState().leftPanel;
const right = () => usePanelState.getState().rightPanel;
const centre = () => usePanelState.getState().centrePanel;

beforeEach(() => {
  usePanelState.setState({
    leftPanel: {
      ...left(),
      mode: "expanded",
      width: RAIL.DEFAULT,
      lastVisible: "expanded",
      hovering: false,
      resizing: false,
      boardsOpen: true,
    },
    centrePanel: { ...centre(), scrollTop: 0 },
    rightPanel: {
      ...right(),
      mode: "panel",
      width: PANEL.DEFAULT,
      level: "normal",
      section: "empty",
    },
  });
});

describe("the left slice", () => {
  it("does not end a preview when it is asked for the mode it already has", () => {
    left().setMode("hidden");
    left().setHovering(true);

    /* The shell commits its layout after every drag and resize. That commit asks
       for "hidden" again — and must not close the preview the pointer is in. */
    left().setMode("hidden");

    expect(left().hovering).toBe(true);
    expect(left().mode).toBe("hidden");
  });

  it("previews only a rail that is off the page", () => {
    left().peek();
    expect(left().hovering).toBe(false);

    left().setMode("hidden");
    left().peek();
    expect(left().hovering).toBe(true);
  });

  it("clamps the width on the way in", () => {
    left().setWidth(9_000);
    expect(left().width).toBe(RAIL.MAX);

    left().setWidth(1);
    expect(left().width).toBe(RAIL.MIN);
  });

  it("remembers the last visible mode, and never the hidden one", () => {
    left().setMode("collapsed");
    expect(left().lastVisible).toBe("collapsed");

    left().setMode("hidden");
    expect(left().lastVisible).toBe("collapsed");

    left().toggleOpenHidden();
    expect(left().mode).toBe("collapsed");
  });

  it("treats a collapsed toggle as a way back out", () => {
    left().setMode("collapsed");
    left().toggleHidden();

    expect(left().mode).toBe("expanded");
  });
});

describe("the right slice", () => {
  it("drops the level when the column closes, so a reopen is not full width", () => {
    right().setLevel("remaining");
    right().setMode("off");

    expect(right().level).toBe("normal");
    expect(right().mode).toBe("off");
  });

  it("clamps the width to the panel's range", () => {
    right().setWidth(5_000);
    expect(right().width).toBe(PANEL.MAX);

    right().setWidth(1);
    expect(right().width).toBe(PANEL.MIN);
  });

  it("toggles between the remaining width and the stored one", () => {
    right().toggleLevel();
    expect(right().level).toBe("remaining");

    right().toggleLevel();
    expect(right().level).toBe("normal");
  });
});

describe("the centre slice", () => {
  it("keeps the scroll position and never stores a negative one", () => {
    centre().setScrollTop(420);
    expect(centre().scrollTop).toBe(420);

    centre().setScrollTop(-10);
    expect(centre().scrollTop).toBe(0);
  });

  it("is the only slice a centre write touches", () => {
    const before = { left: left(), right: right() };
    centre().setScrollTop(120);

    expect(left()).toEqual(before.left);
    expect(right()).toEqual(before.right);
  });
});

describe("what survives a reload", () => {
  it("keeps the choices and nothing else", () => {
    left().setHovering(true);
    left().setResizing(true);
    right().setLevel("remaining");

    const saved = panelStatePersist.partialize(usePanelState.getState());

    expect(saved.leftPanel).toEqual({
      mode: "expanded",
      width: RAIL.DEFAULT,
      lastVisible: "expanded",
      boardsOpen: true,
    });
    expect(saved.rightPanel).toEqual({
      mode: "panel",
      width: PANEL.DEFAULT,
      section: "empty",
    });
    expect(JSON.stringify(saved)).not.toContain("hovering");
    expect(JSON.stringify(saved)).not.toContain("remaining");
  });

  it("validates a hand-edited payload instead of trusting it", () => {
    const merged = panelStatePersist.merge(
      {
        leftPanel: { mode: "sideways", width: 4, lastVisible: "hidden" },
        rightPanel: { mode: "half", width: "wide", section: "nothing" },
      },
      usePanelState.getState(),
    );

    expect(merged.leftPanel.mode).toBe("expanded");
    expect(merged.leftPanel.width).toBe(RAIL.MIN);
    expect(merged.leftPanel.lastVisible).toBe("expanded");
    expect(merged.rightPanel.mode).toBe("panel");
    expect(merged.rightPanel.width).toBe(PANEL.DEFAULT);
    expect(merged.rightPanel.section).toBe("empty");
  });

  it("reads the two keys the stores it replaced wrote, and leaves them alone", () => {
    window.localStorage.setItem(
      "kanban.sidebar",
      JSON.stringify({
        state: {
          mode: "collapsed",
          width: 300,
          lastVisible: "collapsed",
          boardsOpen: false,
        },
        version: 3,
      }),
    );
    window.localStorage.setItem(
      "kanban.right-panel",
      JSON.stringify({
        state: { mode: "off", width: 500, section: "tips" },
        version: 2,
      }),
    );

    const legacy = readLegacyPanels();

    expect(legacy.leftPanel).toEqual({
      mode: "collapsed",
      width: 300,
      lastVisible: "collapsed",
      boardsOpen: false,
    });
    expect(legacy.rightPanel).toEqual({
      mode: "off",
      width: 500,
      section: "tips",
    });

    /* A rollback to the previous build has to find its own state where it left it. */
    expect(window.localStorage.getItem("kanban.sidebar")).not.toBeNull();
    expect(window.localStorage.getItem("kanban.right-panel")).not.toBeNull();
  });
});
