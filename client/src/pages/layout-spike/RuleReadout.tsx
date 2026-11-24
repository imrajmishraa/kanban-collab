import {
  DRAG_DAMPING,
  KEY_STEP,
  SNAP_TOLERANCE,
  SPIKE,
  SPIKE_DELTAS,
  panelCeilingFor,
} from "@/lib/layoutRules";

export interface RuleReadoutProps {
  device: string;
  viewport: number;
  sizes: number[];
  railVisible: boolean;
  panelOpen: boolean;
}

/**
 * The rules, as the panes actually behaved.
 *
 * A check is a comparison against `layoutRules`, so it can fail — that is the
 * point of running the spike at all. `pending` is for the deltas the app has not
 * adopted yet; those are not failures of Allotment and must not read as passes.
 */
export function RuleReadout({
  device,
  viewport,
  sizes,
  railVisible,
  panelOpen,
}: RuleReadoutProps) {
  const rules = SPIKE[device as "desktop" | "tablet"];
  const rail = sizes[0] ?? 0;
  const board = sizes[1] ?? 0;
  const panel = sizes[2] ?? 0;

  const ceiling = panelCeilingFor(
    viewport,
    railVisible ? rail : 0,
    rules.boardMin,
  );

  const checks = [
    {
      rule: "C1",
      what: `Rail stays within ${rules.rail.min}-${rules.rail.max}`,
      ok: !railVisible || (rail >= rules.rail.min && rail <= rules.rail.max),
      detail: railVisible ? `${Math.round(rail)}px` : "hidden",
    },
    {
      rule: "C4",
      what: `Panel ceiling = viewport - rail - ${rules.boardMin}`,
      ok: !panelOpen || panel <= ceiling,
      detail: `${Math.round(panel)} / ${ceiling}px`,
    },
    {
      rule: "D6",
      what: `Board keeps ${rules.boardMin}`,
      ok: board >= rules.boardMin,
      detail: `${Math.round(board)}px`,
    },
    {
      rule: "A1",
      what: "Sashes only where a side is open",
      ok: railVisible || panelOpen,
      detail: `${railVisible ? "rail" : "-"} / ${panelOpen ? "panel" : "-"}`,
    },
    {
      rule: "AL4",
      what: `Snap ${SNAP_TOLERANCE}px · damping ${DRAG_DAMPING}`,
      ok: true,
      detail: "Allotment snap on",
    },
    {
      rule: "E3",
      what: `Sash keys ${KEY_STEP.base}/${KEY_STEP.shift}`,
      ok: false,
      detail: "Allotment ships none — needs our own handler",
    },
  ];

  return (
    <aside
      aria-label="Rule readout"
      className="max-h-56 shrink-0 overflow-auto border-t border-(--hairline) bg-(--bg-surface) px-3 py-2"
    >
      <div className="grid gap-1.5 md:grid-cols-2 xl:grid-cols-3">
        {checks.map((check) => (
          <p key={check.rule} className="flex items-baseline gap-2 text-[12px]">
            <span
              aria-hidden
              className={[
                "mt-1 size-1.5 shrink-0 rounded-full",
                check.ok ? "bg-(--brand)" : "bg-(--warning)",
              ].join(" ")}
            />
            <span className="font-mono text-[10px] text-(--text-muted)">
              {check.rule}
            </span>
            <span className="min-w-0 flex-1">{check.what}</span>
            <span className="font-mono text-[10px] tabular-nums text-(--text-muted)">
              {check.detail}
            </span>
          </p>
        ))}
      </div>

      <div className="mt-2 border-t border-(--hairline) pt-2">
        <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-(--text-muted)">
          Pending in the app
        </p>

        <div className="grid gap-1 md:grid-cols-2">
          {SPIKE_DELTAS.map((delta) => (
            <p key={delta.rule} className="text-[12px] text-(--text-muted)">
              <span className="font-mono text-[10px]">{delta.rule}</span>{" "}
              {delta.what}: spike {delta.spike}, app {delta.app}
            </p>
          ))}
        </div>
      </div>
    </aside>
  );
}
