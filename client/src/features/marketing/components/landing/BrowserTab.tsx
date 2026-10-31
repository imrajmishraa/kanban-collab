import { cn } from "@/utils/cn";
import ChromeIcon from "./ChromeIcon";
import { P } from "./Shared";

export default function Tab({
  label,
  icon,
  active,
  wide,
}: {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-6 min-w-0 items-center gap-2 rounded-t-md px-3 text-[10px]",
        active
          ? "bg-(--tint-4) text-(--text-secondary)"
          : "text-(--text-secondary) transition-colors duration-150 hover:bg-(--bg-hover) hover:text-(--text-secondary)",
      )}
    >
      <span className="flex size-3.5 shrink-0 items-center justify-center">
        {icon}
      </span>
      <span
        className={cn(
          "truncate whitespace-nowrap",
          wide ? "max-w-47.5" : "max-w-30",
        )}
      >
        {label}
      </span>
      {active && (
        <span className="flex size-3 shrink-0 items-center justify-center rounded-sm text-(--text-secondary) transition-colors hover:bg-(--tint-10) hover:text-(--text-secondary)">
          <ChromeIcon d={P.close} size={8} />
        </span>
      )}
    </div>
  );
}
