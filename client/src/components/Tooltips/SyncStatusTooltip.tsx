import type { ReactNode } from "react";

import { Tooltip } from "@/components/Tooltips/ToolTip";
import { syncCopy, type SyncState } from "@/lib/kanbanTooltipText";
import { useNow } from "@/hooks/useNow";

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
  live = false,
}: BaseProps & {
  state: SyncState;
  savedAt?: Date | string | number;
  /** Tick the "Saved 30s ago" line while the bubble is open. */
  live?: boolean;
}) {
  /* A clock only where one was asked for: twenty ticking timers is not a feature. */
  const now = useNow(live ? 1000 : 3_600_000);
  const { label, tone, loading, autoHide } = syncCopy(
    state,
    savedAt,
    live ? now : undefined,
  );

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
