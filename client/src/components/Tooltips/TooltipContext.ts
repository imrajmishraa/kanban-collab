import { createContext } from "react";

export interface TooltipGroupContextValue {
  lastClosedAtRef: React.RefObject<number>;
  markClosed: () => void;
}

export const TooltipContext = createContext<TooltipGroupContextValue | null>(
  null,
);
