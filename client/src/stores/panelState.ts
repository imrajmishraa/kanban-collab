import { create } from "zustand";
import { persist } from "zustand/middleware";

import { PANEL } from "@/components/layout/panelMetrics";
import { RAIL, clampWidth } from "@/lib/railMetrics";
import { isVisibleMode, type SidebarMode } from "@/lib/sidebarMode";
import { RIGHT_PANEL_DEFAULT } from "@/stores/rightPanelTypes";
import {
  panelStatePersist,
  readLegacyPanels,
} from "@/stores/panelStatePersist";
import type {
  LeftPanelState,
  MainPanelState,
  PanelState,
  RightPanelState,
} from "@/stores/panelStateTypes";

/**
 * The one store for the three panes.
 *
 * Every width, mode and preview in the shell is read from here and written here.
 * `lib/shellLayout.ts` still owns the rules — what a drag means, where a floor is
 * — but it is a pure function of this state, and `layoutShellStore.commit()` is
 * the only caller that turns its answer back into a `set`.
 *
 * The old split (a rail store, a column store, and a shell store that read both)
 * is what let one pane's write land on top of another's. One store cannot.
 */

/** A patch to one slice, without reaching into the other two. */
const patchLeft =
  (patch: Partial<LeftPanelState>) =>
  (state: PanelState): PanelState => ({
    ...state,
    leftPanel: { ...state.leftPanel, ...patch },
  });

const patchCentre =
  (patch: Partial<MainPanelState>) =>
  (state: PanelState): PanelState => ({
    ...state,
    centrePanel: { ...state.centrePanel, ...patch },
  });

const patchRight =
  (patch: Partial<RightPanelState>) =>
  (state: PanelState): PanelState => ({
    ...state,
    rightPanel: { ...state.rightPanel, ...patch },
  });

/** What the two stores this replaces had written, so a reload keeps its layout. */
const legacy = readLegacyPanels();

export const usePanelState = create<PanelState>()(
  persist(
    (set, get) => ({
      leftPanel: {
        mode: legacy.leftPanel.mode,
        width: legacy.leftPanel.width,
        lastVisible: legacy.leftPanel.lastVisible,
        boardsOpen: legacy.leftPanel.boardsOpen,
        hovering: false,
        resizing: false,

        /*
         * Asking for the mode it already has is not a change, and must not carry a
         * change's side effects: `hovering` is the preview, and a command that
         * re-asserts "hidden" (the shell commits after every drag and every resize)
         * would otherwise end a preview the pointer is still in.
         */
        setMode: (mode: SidebarMode) => {
          if (get().leftPanel.mode === mode) return;

          set(
            patchLeft({
              mode,
              hovering: false,
              ...(isVisibleMode(mode) ? { lastVisible: mode } : {}),
            }),
          );
        },

        setWidth: (width: number) =>
          set(patchLeft({ width: clampWidth(width) })),
        setHovering: (hovering: boolean) => set(patchLeft({ hovering })),
        setResizing: (resizing: boolean) => set(patchLeft({ resizing })),

        toggleCollapsed: () => {
          const { mode, lastVisible } = get().leftPanel;
          const next: SidebarMode =
            mode === "expanded" ? "collapsed" : "expanded";

          set(
            patchLeft({
              mode: next,
              hovering: false,
              lastVisible: isVisibleMode(next) ? next : lastVisible,
            }),
          );
        },

        collapse: () => set(patchLeft({ mode: "collapsed", hovering: false })),
        expand: () =>
          set(
            patchLeft({
              mode: "expanded",
              hovering: false,
              lastVisible: "expanded",
            }),
          ),
        hide: () => set(patchLeft({ mode: "hidden", hovering: false })),

        /*
         * The one toggle: ⌘B, and the navbar button while the rail is hidden.
         * Pressing it with the rail collapsed used to be a no-op, which reads as a
         * broken shortcut, so collapsed now opens.
         */
        toggleHidden: () => {
          const { mode, lastVisible } = get().leftPanel;

          if (mode === "hidden") {
            set(patchLeft({ mode: lastVisible, hovering: false }));
            return;
          }

          if (mode === "collapsed") {
            set(
              patchLeft({
                mode: "expanded",
                hovering: false,
                lastVisible: "expanded",
              }),
            );
            return;
          }

          set(patchLeft({ mode: "collapsed", hovering: false }));
        },

        openFromPreview: () =>
          set(
            patchLeft({
              mode: "expanded",
              hovering: false,
              lastVisible: "expanded",
            }),
          ),

        toggleOpenHidden: () => {
          const { mode, lastVisible } = get().leftPanel;

          if (mode === "hidden") {
            set(patchLeft({ mode: lastVisible, hovering: false }));
            return;
          }

          set(patchLeft({ mode: "hidden", hovering: false }));
        },

        /* Only a rail that is off the page previews; the mode does not change. */
        peek: () => {
          if (get().leftPanel.mode !== "hidden") return;
          set(patchLeft({ hovering: true }));
        },
        unpeek: () => set(patchLeft({ hovering: false })),

        toggleBoards: () =>
          set((state) =>
            patchLeft({ boardsOpen: !state.leftPanel.boardsOpen })(state),
          ),
        openBoards: () => set(patchLeft({ boardsOpen: true })),
        closeBoards: () => set(patchLeft({ boardsOpen: false })),
      },

      centrePanel: {
        scrollTop: 0,
        setScrollTop: (scrollTop: number) =>
          set(patchCentre({ scrollTop: Math.max(0, Math.round(scrollTop)) })),
      },

      rightPanel: {
        mode: legacy.rightPanel.mode,
        width: legacy.rightPanel.width,
        level: "normal",
        section: legacy.rightPanel.section,

        setMode: (mode) =>
          set((state) =>
            patchRight({
              mode,
              /* Closing drops the level, or the next open would come back over the
                 whole board. */
              level: mode === "off" ? "normal" : state.rightPanel.level,
            })(state),
          ),
        setWidth: (width: number) =>
          set((state) =>
            patchRight({
              width: Math.min(
                Math.max(PANEL.MIN, Math.round(width)),
                PANEL.MAX,
              ),
            })(state),
          ),
        setLevel: (level) => set(patchRight({ level })),
        setSection: (section) => set(patchRight({ section })),
        toggleLevel: () =>
          set((state) =>
            patchRight({
              level:
                state.rightPanel.level === "remaining" ? "normal" : "remaining",
            })(state),
          ),
        toggle: () =>
          set((state) =>
            patchRight({
              mode: state.rightPanel.mode === "off" ? "panel" : "off",
              level: "normal",
            })(state),
          ),
      },
    }),
    {
      /* One key, versioned from the first write. The two it replaces are read once,
         in `readLegacyPanels`, and left where they are. */
      name: "kanban.panels",
      version: 1,
      ...panelStatePersist,
    },
  ),
);

/** `panel` is the column's default mode; named here so callers do not import it twice. */
export const PANEL_MODE_DEFAULT = RIGHT_PANEL_DEFAULT;
export const RAIL_WIDTH_DEFAULT = RAIL.DEFAULT;
