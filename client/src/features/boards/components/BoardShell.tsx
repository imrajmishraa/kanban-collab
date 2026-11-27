import type { ReactNode } from "react";

export function BoardShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-(--bg-root) text-(--text-primary)">
      <div className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}

/** Empty / informational state shown when there is nothing to render. */
