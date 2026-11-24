import type { ReactNode } from "react";

import { Tooltip } from "@/components/Tooltips/ToolTip";

interface BaseProps {
  children: ReactNode;
  /** Passed through: the board's tooltips are mostly on the right of a rail. */
  side?: "top" | "bottom" | "left" | "right";
  disabled?: boolean;
}

/** "Rahul is editing this card" — the presence avatar, not a paragraph. */
export function PresenceTooltip({
  name,
  action = "is editing this card",
  avatar,
  children,
  side,
}: BaseProps & {
  name: string;
  action?: string;
  avatar?: { src: string; alt?: string };
}) {
  return (
    <Tooltip label={`${name} ${action}`} avatar={avatar} side={side}>
      {children}
    </Tooltip>
  );
}
