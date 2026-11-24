import type { ReactNode } from "react";

import { Tooltip } from "@/components/Tooltips/ToolTip";

interface BaseProps {
  children: ReactNode;
  /** Passed through: the board's tooltips are mostly on the right of a rail. */
  side?: "top" | "bottom" | "left" | "right";
  disabled?: boolean;
}

/** What a destructive action will do, in danger, with the detail on a second line. */
export function DestructiveTooltip({
  action,
  detail,
  children,
  side,
  disabled,
}: BaseProps & { action: string; detail: string }) {
  return (
    <Tooltip
      label={action}
      description={detail}
      tone="danger"
      maxLines={2}
      side={side}
      disabled={disabled}
    >
      {children}
    </Tooltip>
  );
}
