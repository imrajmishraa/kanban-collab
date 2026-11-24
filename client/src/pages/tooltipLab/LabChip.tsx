import { Tooltip } from "@/components/Tooltips/ToolTip";

/** The one button the lab repeats: a tooltip around a plain chip. */
export function LabChip({
  children,
  label,
  ...rest
}: React.ComponentProps<typeof Tooltip> & { children: React.ReactNode }) {
  return (
    <Tooltip {...rest} label={label}>
      <button
        type="button"
        className="rounded-lg border border-(--hairline) bg-(--bg-card) px-3 py-1.5 text-[12px] text-(--text-secondary) hover:bg-(--bg-hover)"
      >
        {children}
      </button>
    </Tooltip>
  );
}
