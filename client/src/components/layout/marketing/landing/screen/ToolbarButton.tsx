import { cn } from "@/lib/utils";
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
        "flex size-7 items-center justify-center cursor-pointer rounded-md text-zinc-400",
        "transition-colors duration-150 hover:bg-white/10 hover:text-zinc-100",
      )}
    >
      <ChromeIcon d={d} size={size} />
    </span>
  );
}
