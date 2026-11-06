import { useCallback, useSyncExternalStore } from "react";

/**
 * True while `query` matches the viewport, and it keeps up when the window is
 * resized or the device is rotated.
 *
 * The media query *is* the external store, so it goes through
 * `useSyncExternalStore` and not `useState` + `useEffect`: reading it inside an
 * effect and calling `setState` there is a cascading render (and the lint rule
 * that flagged the earlier version was right). There is also no first-frame
 * guess to correct — the snapshot is read during render.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);

      /* Safari < 14 only has the deprecated listener API. */
      if (typeof mql.addEventListener === "function") {
        mql.addEventListener("change", onChange);
        return () => mql.removeEventListener("change", onChange);
      }

      mql.addListener(onChange);
      return () => mql.removeListener(onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    /* No server pass in this app; false is the neutral answer if there is. */
    () => false,
  );
}
