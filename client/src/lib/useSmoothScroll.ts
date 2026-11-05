import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Slow, weighted scrolling for the public pages.
 *
 * The browser's wheel scroll is instant: one notch, one jump. This wraps the
 * window scroll in Lenis, which lerps towards the target instead of jumping, so
 * a notch glides rather than snaps.
 *
 * `LERP` is the only number that matters. Each frame it covers that fraction of
 * the distance still left, so the scroll eases in and settles rather than
 * jumping. Higher is faster, and 1 is no smoothing at all.
 *
 * Time to cover 99 percent of a scroll, at 60 frames a second:
 *
 *     0.04   1.88s     very heavy
 *     0.055  1.36s     what this shipped with — too slow in practice
 *     0.07   1.06s
 *     0.08   0.92s     current: clearly eased, still responsive
 *     0.10   0.73s     Lenis' own default
 *     0.12   0.60s
 *     0.15   0.47s     close to native
 *
 * Past about 0.15 the easing stops being visible, so treat that as the ceiling.
 *
 * Mounted from `PublicLayout` rather than the app root on purpose: the dashboard
 * is full of nested scroll containers — the sidebar, board columns, the command
 * palette — and hijacking the wheel there breaks all of them. The marketing
 * pages are plain documents, so they are the safe place to do it. Any nested
 * scroller on a public page can opt out with `data-lenis-prevent`.
 *
 * Lenis is a dependency: `npm install lenis`.
 */
const LERP = 0.15;

/* The live instance, so anything that wants to scroll the page can go through
   Lenis instead of `window.scrollTo`. That matters: `window.scrollTo` sets the
   native position, Lenis immediately lerps back towards its own target, and the
   two cancel each other out — which is why the back-to-top button looked
   broken. */
let active: Lenis | null = null;

/**
 * Scrolls the window to a position, through Lenis when it is running.
 *
 * `duration` is in seconds. It is deliberately shorter than a wheel scroll
 * takes to settle: a button press is a command, not a nudge, so it should feel
 * decided rather than lazy.
 */
export function scrollWindowTo(top: number, duration = 1.1) {
  if (active) {
    active.scrollTo(top, { duration });
    return;
  }
  window.scrollTo({ top, behavior: "smooth" });
}

/** Back to the top of the page, however the page is being scrolled. */
export function scrollWindowToTop() {
  scrollWindowTo(0);
}

export function useSmoothScroll() {
  useEffect(() => {
    /* Anyone who has asked their system to reduce motion keeps the browser's own
       scrolling. Smoothing is exactly the movement that setting exists to switch
       off, so it is not a preference to override. */
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    const lenis = new Lenis({
      lerp: LERP,
      smoothWheel: true,
      /* Touch already carries momentum from the OS; doubling it feels broken. */
      syncTouch: false,
      /* Anchor links inside a page should still land where they point. */
      anchors: true,
    });

    active = lenis;

    let frame = requestAnimationFrame(function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });

    /* If the setting changes while the page is open, stop rather than keep
       easing behind the user's back. */
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) lenis.destroy();
    };
    reduced.addEventListener("change", onChange);

    return () => {
      reduced.removeEventListener("change", onChange);
      cancelAnimationFrame(frame);
      lenis.destroy();
      active = null;
    };
  }, []);
}
