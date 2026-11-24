import type { ReactNode } from "react";

import { Tooltip } from "@/components/Tooltips/ToolTip";
import { syncCopy, type SyncState } from "@/lib/kanbanTooltipText";

interface BaseProps {
  children: ReactNode;
  /** Passed through: the board's tooltips are mostly on the right of a rail. */
  side?: "top" | "bottom" | "left" | "right";
  disabled?: boolean;
}

/** Saving, saved, offline, failed — with the spinner and the self-closing flash. */
export function SyncStatusTooltip({
  state,
  savedAt,
  children,
  side,
  disabled,
}: BaseProps & { state: SyncState; savedAt?: Date | string | number }) {
  const { label, tone, loading, autoHide } = syncCopy(state, savedAt);

  return (
    <Tooltip
      label={label}
      tone={tone}
      loading={loading}
      autoHide={autoHide}
      side={side}
      disabled={disabled}
    >
      {children}
    </Tooltip>
  );
}
