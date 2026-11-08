import type { ReactNode } from "react";

/** The mono register: labels, counts, keys. */
export default function Mono({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`font-mono text-[10px] uppercase leading-3.5 tracking-[0.16em] text-(--text-muted) ${className}`}
    >
      {children}
    </span>
  );
}
