import type { ReactNode } from "react";

/** A key chord, set the way the product sets one: mono, small, quiet. */
export default function Shortcut({ children }: { children: ReactNode }) {
  return (
    <span className="shrink-0 font-mono text-[9px] tracking-[0.02em] text-(--text-subtle) sm:text-[10px]">
      {children}
    </span>
  );
}
