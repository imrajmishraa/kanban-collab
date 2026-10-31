import { cn } from "@/utils/cn";
import ChromeIcon from "./ChromeIcon";

export default function ToolbarButton({
  d,
  size = 14,
}: {
  d: string;
  size?: number;
}) {
  return (
    <span
      className={cn(
        "flex size-7 items-center justify-center cursor-pointer rounded-md text-(--text-secondary)",
        "transition-colors duration-150 hover:bg-(--tint-10) hover:text-(--text-secondary)",
      )}
    >
      <ChromeIcon d={d} size={size} />
    </span>
  );
}
