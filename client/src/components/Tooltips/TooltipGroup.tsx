// client/src/components/Tooltips/TooltipGroup.tsx
import { useRef, type ReactNode } from "react";
import { TooltipContext } from "./TooltipContext";

export function TooltipGroup({ children }: { children: ReactNode }) {
  const lastClosedAtRef = useRef(0);

  const markClosed = () => {
    lastClosedAtRef.current = Date.now();
  };

  return (
    <TooltipContext.Provider value={{ lastClosedAtRef, markClosed }}>
      {children}
    </TooltipContext.Provider>
  );
}
