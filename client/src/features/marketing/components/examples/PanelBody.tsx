import type { ReactNode } from "react";

interface PanelBodyProps {
  children: ReactNode;
  className?: string;
}

/** The 8px inset a menu's rows sit in, so a row's tint stops short of the edge. */
export default function PanelBody({
  children,
  className = "",
}: PanelBodyProps) {
  return <div className={`p-1.5 sm:p-2 ${className}`}>{children}</div>;
}
