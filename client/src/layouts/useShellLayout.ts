import {
  useCallback,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from "react";

import {
  useGroupRef,
  type Layout,
  type LayoutChangedMeta,
} from "react-resizable-panels";

import {
  computeLayout,
  divergence,
  initialSizes,
  settleDrag,
  type Edge,
  type ShellState,
} from "@/lib/shellLayout";

/** The group's measured width in px, 0 until the first measurement. */
function useElementWidth(elementRef: React.RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    setWidth(element.clientWidth);

    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setWidth(element.clientWidth));
    });

    observer.observe(element);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [elementRef]);

  return width;
}

interface Args {
  /** What the reader chose (the stores, read together). */
  state: ShellState;
  /** Write a change back. Called only for user drags and commands. */
  commit: (patch: Partial<ShellState>) => void;
  /** The measured group width, for anything that needs it (the readout). */
  onWidth?: (width: number) => void;
}

/**
 * The one place the shell's layout is written.
 *
 * - `state` + the measured width go into `computeLayout`, and the answer goes to
 *   the library in a single `Group.setLayout()`. No `expand()`, no `resize()`, no
 *   `collapse()`: each of those re-lays the group out by itself, which is what
 *   interleaved and dropped the restore in F1.
 * - `onLayoutChanged` is the only reader, and it listens only to
 *   `meta.isUserInteraction`. Our own `setLayout`, the first mount, constraint
 *   recomputes and window resizes all report `false`, so none of them can write a
 *   width or a mode back (F4: nothing is inferred from a measurement any more).
 * - After a user drag the layout is applied again, so a neighbour the drag pushed
 *   (the rail, in F2) goes back to its stored width.
 */
export function useShellLayout({ state, commit, onWidth }: Args) {
  const groupRef = useGroupRef();
  const groupEl = useRef<HTMLDivElement | null>(null);
  const width = useElementWidth(groupEl);

  /* Frozen at mount. The library treats a changed `defaultSize` as a constraint
     change and re-lays the group out, which would fight the `setLayout` below. */
  const [initial] = useState(() => initialSizes(state));

  /* The separator the reader last touched: pointer or keyboard focus. It decides
     which pane a user drag is allowed to write. */
  const edge = useRef<Edge | null>(null);

  /* Bumped after each user drag to force one re-apply even when no stored value
     changed (the drag disturbed a neighbour we deliberately did not store). */
  const [settled, bumpSettled] = useReducer((n: number) => n + 1, 0);

  const stateRef = useRef(state);
  const widthRef = useRef(width);

  useLayoutEffect(() => {
    stateRef.current = state;
    widthRef.current = width;
    onWidth?.(width);
  });

  const { railOpen, railCollapsed, railPx, columnOpen, columnPx, fullWidth } =
    state;

  useLayoutEffect(() => {
    const group = groupRef.current;

    /* Unmeasured: `defaultSize` carries the first frame, and this runs again the
       moment a width exists. Never guess a width. */
    if (!group || width <= 0) return;

    const want = computeLayout(width, {
      railOpen,
      railCollapsed,
      railPx,
      columnOpen,
      columnPx,
      fullWidth,
    });
    const got = group.setLayout(want);

    if (import.meta.env.DEV && divergence(want, got) > 0.5) {
      console.warn(
        "[shell] the library did not apply the requested layout — a constraint won",
        { want, got, width },
      );
    }
  }, [
    groupRef,
    width,
    railOpen,
    railCollapsed,
    railPx,
    columnOpen,
    columnPx,
    fullWidth,
    settled,
  ]);

  const onLayoutChanged = useCallback(
    (layout: Layout, meta: LayoutChangedMeta) => {
      if (!meta.isUserInteraction) return;

      commit(
        settleDrag(
          widthRef.current,
          layout as Record<"leftPanel" | "centreLayout" | "rightPanel", number>,
          edge.current,
          stateRef.current,
        ),
      );
      bumpSettled();
    },
    [commit],
  );

  /** Spread onto each `<Separator>` so a drag knows which edge it is. */
  const separatorProps = (which: Edge) => ({
    onPointerDown: () => {
      edge.current = which;
    },
    onFocus: () => {
      edge.current = which;
    },
  });

  return {
    groupRef,
    groupEl,
    /** Which divider the pointer is on, so a live drag can rebalance. */
    edgeRef: edge,
    onLayoutChanged,
    separatorProps,
    /** Pixel `defaultSize`s for the first frame (numbers are pixels in v4). */
    initial,
  };
}
