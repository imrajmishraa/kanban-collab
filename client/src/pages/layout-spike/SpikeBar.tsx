interface SpikeBarProps {
  device: string;
  viewport: number;
  sizes: number[];
  railVisible: boolean;
  panelOpen: boolean;
  /** `remaining`: the column takes viewport − rail and the stage yields. */
  fullWidth: boolean;
  showRules: boolean;
  onToggleRail: () => void;
  onTogglePanel: () => void;
  onToggleFullWidth: () => void;
  onToggleRules: () => void;
}

export function SpikeBar({
  device,
  viewport,
  sizes,
  railVisible,
  panelOpen,
  fullWidth,
  showRules,
  onToggleRail,
  onTogglePanel,
  onToggleFullWidth,
  onToggleRules,
}: SpikeBarProps) {
  const rail = sizes[0] ?? 0;
  const board = sizes[1] ?? 0;
  const panel = sizes[2] ?? 0;

  return (
    <header className="flex shrink-0 flex-wrap items-center gap-3 border-b border-(--hairline) px-3 py-2">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-(--text-muted)">
        Layout spike
      </span>

      <span className="rounded-full border border-(--hairline) px-2 py-0.5 font-mono text-[10px] text-(--text-muted)">
        {device} · {viewport}px
      </span>

      <span className="font-mono text-[11px] tabular-nums text-(--text-muted)">
        rail {railVisible ? Math.round(rail) : "off"} · board{" "}
        {Math.round(board)} · panel {panelOpen ? Math.round(panel) : "off"}
      </span>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleRail}
          className="rounded-md border border-(--hairline) px-2 py-1 text-[12px] hover:bg-(--bg-hover)"
        >
          {railVisible ? "Hide rail" : "Show rail"}
        </button>

        <button
          type="button"
          onClick={onTogglePanel}
          className="rounded-md border border-(--hairline) px-2 py-1 text-[12px] hover:bg-(--bg-hover)"
        >
          {panelOpen ? "Close panel" : "Open panel"}
        </button>

        <button
          type="button"
          onClick={onToggleFullWidth}
          aria-pressed={fullWidth}
          title="Take everything the rail leaves (⌘⇧J)"
          className="rounded-md border border-(--hairline) px-2 py-1 text-[12px] hover:bg-(--bg-hover) aria-pressed:border-(--brand) aria-pressed:text-(--brand)"
        >
          {fullWidth ? "Exit full width" : "Full width"}
        </button>

        <button
          type="button"
          onClick={onToggleRules}
          aria-pressed={showRules}
          className="rounded-md border border-(--hairline) px-2 py-1 text-[12px] hover:bg-(--bg-hover)"
        >
          Rules
        </button>
      </div>
    </header>
  );
}
