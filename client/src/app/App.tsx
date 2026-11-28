import { BrowserRouter } from "react-router-dom";
import { MotionConfig } from "framer-motion";

import { AppRouter } from "@app/router";
import RouteErrorBoundary from "@/components/feedback/RouteErrorBoundary";
import SplashHost from "@/components/feedback/SplashHost";
import QueryProvider from "./providers/QueryProvider";
import ScrollToTop from "./ScrollToTop";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <QueryProvider>
        {/* A route that fails to render — most often a lazy chunk that never
            arrived — shows the retry card instead of a blank page. */}
        {/* One place decides what a reader who asked for reduced motion
            gets: transforms and layout animations are dropped, opacity
            steps stay, so nothing ever moves without a cause. */}
        <MotionConfig reducedMotion="user">
          <RouteErrorBoundary>
            <AppRouter />
          </RouteErrorBoundary>
        </MotionConfig>
      </QueryProvider>

      {/* Outside the provider tree on purpose: the splash must not remount when
          a route tree does. It renders itself only while something is loading. */}
      <SplashHost />
    </BrowserRouter>
  );
}
