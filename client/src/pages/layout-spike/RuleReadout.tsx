import {
  DRAG_DAMPING,
  SNAP_TOLERANCE,
  SPIKE,
  panelCeilingFor,
} from "@/lib/layoutRules";
import { panelConfigByDevice, percentOf } from "@/lib/panelConfig";

import { pendingDeltas } from "./pendingDeltas";

interface RuleReadoutProps {
  device: string;
  viewport: number;
  sizes: { left: number; centre: number; right: number };
  railVisible: boolean;
  panelOpen: boolean;
}

/**
 * The rules, as the panes actually behaved.
 *
 * Sizes arrive in pixels (converted from the group's percentages), and the
 * config's own numbers are the expectations — so a check fails when the engine
 * and the config disagree, not when someone edits a comment.
 */
export function RuleReadout({
  device,
  viewport,
  sizes,
  railVisible,
  panelOpen,
}: RuleReadoutProps) {
  const config = panelConfigByDevice[device as "desktop" | "tablet"];
  const rules = SPIKE[device as "desktop" | "tablet"];

  const ceiling = panelCeilingFor(
    viewport,
    railVisible ? sizes.left : 0,
    rules.boardMin,
  );
  const pending = pendingDeltas();

  const leftShare = viewport ? Math.round((sizes.left / viewport) * 100) : 0;
  const rightShare = viewport ? Math.round((sizes.right / viewport) * 100) : 0;

  const checks = [
    {
      rule: "C1",
      what: `LeftPanel ≥ ${config.leftPanel.minSize}px and ≤ ${config.leftPanel.maxSize}`,
      ok:
        !railVisible ||
        (sizes.left >= config.leftPanel.minSize - 1 &&
          leftShare <= percentOf(config.leftPanel.maxSize)),
      detail: railVisible ? `${sizes.left}px · ${leftShare}%` : "collapsed",
    },
    {
      rule: "C4",
      what: `RightPanel within its ceiling (${ceiling}px)`,
      ok: !panelOpen || sizes.right <= ceiling + 1,
      detail: panelOpen ? `${sizes.right}px · ${rightShare}%` : "off",
    },
    {
      rule: "D6",
      what: `Workspace keeps ${config.workspaceLayout.minSize}px`,
      ok: sizes.centre >= config.workspaceLayout.minSize - 1,
      detail: `${sizes.centre}px`,
    },
    {
      rule: "E3",
      what: "Separators: role, tab stop, arrows, Home/End",
      ok: true,
      detail: "built into the library",
    },
    {
      rule: "AL4",
      what: `Snap ${SNAP_TOLERANCE}px · damping ${DRAG_DAMPING} (ours, on the app's own dividers)`,
      ok: true,
      detail: "library handles the group",
    },
    {
      rule: "SUM",
      what: "Percentages add up to 100",
      ok:
        Math.abs(
          leftShare +
            rightShare +
            Math.round((sizes.centre / viewport) * 100) -
            100,
        ) <= 1,
      detail: `${leftShare} + ${Math.round((sizes.centre / viewport) * 100)} + ${rightShare}`,
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
