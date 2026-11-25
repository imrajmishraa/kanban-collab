export type SpikeLevel = "normal" | "remaining" | "full";

interface SpikeBarProps {
  device: string;
  viewport: number;
  sizes: number[];
  railVisible: boolean;
  panelOpen: boolean;
  level: SpikeLevel;
  showRules: boolean;
  onChangeLevel: (level: SpikeLevel) => void;
  onToggleRail: () => void;
  onTogglePanel: () => void;
  onToggleRules: () => void;
}

const LEVELS: { id: SpikeLevel; label: string; title: string }[] = [
  {
    id: "normal",
    label: "Normal",
    title: "Rail, board and column, each with a floor",
  },
  {
    id: "remaining",
    label: "Remaining",
    title: "The column takes everything the rail leaves",
  },
  {
    id: "full",
    label: "Full",
    title: "The column takes the window; the rail steps off",
  },
];

export function SpikeBar({
  device,
  viewport,
  sizes,
  railVisible,
  panelOpen,
  level,
  showRules,
  onChangeLevel,
  onToggleRail,
  onTogglePanel,
  onToggleRules,
}: SpikeBarProps) {
  const rail = sizes[0] ?? 0;
  const board = sizes[1] ?? 0;
  const panel = sizes[2] ?? 0;

  return (
    <header className="flex shrink-0 flex-wrap items-center gap-3 border-b border-(--hairline) px-3 py-2">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-(--text-muted)">
        Allotment spike
      </span>

      <span className="rounded-full border border-(--hairline) px-2 py-0.5 font-mono text-[10px] text-(--text-muted)">
        {device} · {viewport}px
      </span>

      <span className="font-mono text-[11px] tabular-nums text-(--text-muted)">
        rail {railVisible ? Math.round(rail) : "off"} · board{" "}
        {level === "normal" ? Math.round(board) : "off"} · panel{" "}
        {panelOpen ? Math.round(panel) : "off"}
      </span>

      <div
        className="flex items-center gap-1"
        role="group"
        aria-label="Layout level"
      >
        {LEVELS.map((option) => (
          <button
            key={option.id}
            type="button"
            title={option.title}
            aria-pressed={level === option.id}
            onClick={() => onChangeLevel(option.id)}
            className={[
              "rounded-md border px-2 py-1 text-[12px]",
              level === option.id
                ? "border-(--brand) bg-(--bg-hover) text-(--text-primary)"
                : "border-(--hairline) text-(--text-muted) hover:bg-(--bg-hover)",
            ].join(" ")}
          >
            {option.label}
          </button>
        ))}
      </div>

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
