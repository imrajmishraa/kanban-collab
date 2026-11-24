import { useContext } from "react";
import { TooltipContext } from "./TooltipContext";

export function useTooltipGroup() {
  return useContext(TooltipContext);
}
