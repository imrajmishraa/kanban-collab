import type { ReactNode } from "react";

import { Tooltip } from "@/components/Tooltips/ToolTip";
import { wipCopy } from "@/lib/kanbanTooltipText";

interface BaseProps {
  children: ReactNode;
  /** Passed through: the board's tooltips are mostly on the right of a rail. */
  side?: "top" | "bottom" | "left" | "right";
  disabled?: boolean;
}

/** "5/5 cards — limit reached" in warning, and danger once it is over. */
export function WipLimitTooltip({
  count,
  limit,
  children,
  side,
  disabled,
}: BaseProps & { count: number; limit: number }) {
  const { label, tone } = wipCopy(count, limit);

  return (
    <Tooltip label={label} tone={tone} side={side} disabled={disabled}>
      {children}
    </Tooltip>
  );
}
