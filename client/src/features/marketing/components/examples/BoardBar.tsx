import type { ReactNode } from "react";

interface BoardBarProps {
  title: string;
  children?: ReactNode;
}

/** The title row every preview mock shares. */
export default function BoardBar({ title, children }: BoardBarProps) {
  return (
    <div className="flex items-center gap-2 border-b border-(--hairline) px-3 py-2.5">
      <span className="text-[13px] font-semibold tracking-[-0.2px] text-(--text-primary)">
        {title}
      </span>
      <span className="flex-1" />
      {children}
    </div>
  );
}
