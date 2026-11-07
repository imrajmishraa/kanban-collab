import type { ReactNode } from "react";

/**
 * The frame every marketing page sits in: the light palette, the page ink, and
 * the `marketing` scope the section styles are written against. Same wrapper
 * `HomePage` uses, so a new page cannot forget one of the three.
 */
export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="light-theme marketing relative min-h-screen bg-(--bg-root) text-(--text-primary)">
      <main className="relative z-0">{children}</main>
    </div>
  );
}
