import {
  DRAG_DAMPING,
  KEY_STEP,
  SNAP_TOLERANCE,
  SPIKE,
  panelCeilingFor,
} from "@/lib/layoutRules";

import type { SpikeLevel } from "./SpikeBar";
import { pendingDeltas } from "./pendingDeltas";

interface RuleReadoutProps {
  device: string;
  viewport: number;
  sizes: number[];
  level: SpikeLevel;
  railVisible: boolean;
  panelOpen: boolean;
  /** Rule 1: what the column is allowed to reach right now. */
  panelMax: number;
  /** Rule 3: what the rail is allowed to reach right now. */
  railMax: number;
}

/**
 * The rules, as the panes actually behaved.
 *
 * A check compares the live sizes against `layoutRules`, so it can fail — that is
 * the point of running the spike at all. `pendingDeltas()` lists only the
 * numbers the app has still not adopted; a delta disappears on its own once the
 * app catches up.
 */
export function RuleReadout({
  device,
  viewport,
  sizes,
  level,
  railVisible,
  panelOpen,
  panelMax,
  railMax,
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
  const pending = pendingDeltas();

  const checks = [
    {
      rule: "C1",
      what: `Rail within ${rules.rail.min}-${Math.round(railMax)}`,
      ok: !railVisible || (rail >= rules.rail.min && rail <= railMax + 1),
      detail: railVisible ? `${Math.round(rail)}px` : "hidden",
    },
    {
      rule: "C4",
      what: `Column within its ceiling (${ceiling})`,
      ok: !panelOpen || panel <= Math.max(panelMax, ceiling) + 1,
      detail: panelOpen
        ? `${Math.round(panel)} / ${Math.round(panelMax)}`
        : "off",
    },
    {
      rule: "D6",
      what:
        level === "normal"
          ? `Board keeps ${rules.boardMin}`
          : "Board yielded to the column",
      ok: level !== "normal" || board >= rules.boardMin,
      detail: level === "normal" ? `${Math.round(board)}px` : "off",
    },
    {
      rule: "R2",
      what: "Both edges push: neither drag is capped while the other has room",
      ok: railMax > rules.rail.max || !panelOpen,
      detail: panelOpen ? `rail max ${Math.round(railMax)}` : "rail alone",
    },
    {
      rule: "E3",
      what: `Sash keys ${KEY_STEP.base}/${KEY_STEP.shift}, Home/End to the stops`,
      ok: true,
      detail: "ours, on .sash",
    },
    {
      rule: "AL4",
      what: `Snap ${SNAP_TOLERANCE}px · damping ${DRAG_DAMPING}`,
      ok: true,
      detail: "Allotment snap on",
    },
  ];

  return (
    <aside
      aria-label="Rule readout"
      className="max-h-60 shrink-0 overflow-auto border-t border-(--hairline) bg-(--bg-surface) px-3 py-2"
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
          {pending.length ? "Pending in the app" : "App matches the spike"}
        </p>

        <div className="grid gap-1 md:grid-cols-2">
          {pending.map((delta) => (
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
