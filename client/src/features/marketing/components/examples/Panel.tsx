import type { ReactNode } from "react";

interface PanelProps {
  children: ReactNode;
  className?: string;
}

/** An absolutely positioned panel. The caller places it with `className`. */
export default function Panel({ children, className = "" }: PanelProps) {
  return (
    <div
      className={[
        "absolute overflow-hidden rounded-xl border border-(--hairline)",
        "bg-(--bg-surface) text-(--text-primary)",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
