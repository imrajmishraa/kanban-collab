import { BrowserRouter } from "react-router-dom";

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
        <RouteErrorBoundary>
          <AppRouter />
        </RouteErrorBoundary>
      </QueryProvider>

      {/* Outside the provider tree on purpose: the splash must not remount when
          a route tree does. It renders itself only while something is loading. */}
      <SplashHost />
    </BrowserRouter>
  );
}
