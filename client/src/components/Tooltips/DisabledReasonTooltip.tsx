import type { ReactNode } from "react";

import { Tooltip } from "@/components/Tooltips/ToolTip";

interface BaseProps {
  children: ReactNode;
  /** Passed through: the board's tooltips are mostly on the right of a rail. */
  side?: "top" | "bottom" | "left" | "right";
  disabled?: boolean;
}

/**
 * Why an action is not available.
 *
 * A disabled button receives no pointer events, so the trigger is wrapped in a span that
 * does — otherwise the explanation is unreachable, which is the whole point of having it.
 */
export function DisabledReasonTooltip({
  reason,
  children,
  side,
}: BaseProps & { reason: string }) {
  return (
    <Tooltip label={reason} side={side}>
      <span tabIndex={0} className="inline-flex cursor-not-allowed">
        {children}
      </span>
    </Tooltip>
  );
}
