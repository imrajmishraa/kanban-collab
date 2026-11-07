import { Component, type ErrorInfo, type ReactNode } from "react";

import LoadError from "./LoadError";

interface RouteErrorBoundaryProps {
  children: ReactNode;
}

interface RouteErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches whatever a route throws while rendering — most often a lazy chunk
 * that never arrived, which is the one failure Suspense cannot recover from on
 * its own — and shows the retry card instead of a blank screen.
 *
 * A class, not a hook: `componentDidCatch` is still the only way to catch render
 * errors. Retry clears the error and re-renders, which re-runs the lazy import;
 * if that fails again the card comes back.
 */
export default class RouteErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  state: RouteErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    /* Nothing to report it to yet; the console is where a developer looks. */
    console.error("Route failed to render", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <LoadError
        title="Couldn't load this page"
        description="Something went wrong loading it. Try again."
        onRetry={() => this.setState({ error: null })}
      />
    );
  }
}
