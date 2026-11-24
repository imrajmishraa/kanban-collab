import type { ReactNode } from "react";

import { Tooltip } from "@/components/Tooltips/ToolTip";
import { dueDateCopy } from "@/lib/kanbanTooltipText";

interface BaseProps {
  children: ReactNode;
  /** Passed through: the board's tooltips are mostly on the right of a rail. */
  side?: "top" | "bottom" | "left" | "right";
  disabled?: boolean;
}

/** "Overdue by 2 days" in danger, "Due tomorrow" in warning, quiet beyond a week. */
export function DueDateTooltip({
  due,
  children,
  side,
  disabled,
}: BaseProps & { due: Date | string | number }) {
  const { label, tone } = dueDateCopy(due);

  return (
    <Tooltip label={label} tone={tone} side={side} disabled={disabled}>
      {children}
    </Tooltip>
  );
}
