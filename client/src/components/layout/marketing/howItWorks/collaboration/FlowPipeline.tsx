import { Fragment } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown02Icon,
  ArrowRight02Icon,
} from "@hugeicons/core-free-icons";

import { FLOW_STAGES, type FlowStage } from "./flowData";

/* ═══════════════════════════════════════════════════════════════
   PIPELINE — the three numbered nodes with connectors between them
   ═══════════════════════════════════════════════════════════════ */

export default function FlowPipeline() {
  return (
    <div className="border-b border-white/6 p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch lg:gap-3">
        {FLOW_STAGES.map((stage, i) => (
          <Fragment key={stage.number}>
            <FlowStageCard {...stage} />

            {i < FLOW_STAGES.length - 1 && <FlowConnector />}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

/* ── Numbered node ─────────────────────────────────────────────── */

function FlowStageCard({
  number,
  title,
  description,
  icon,
  active,
}: FlowStage) {
  return (
    <div
      className={`
        group/stage relative overflow-hidden rounded-lg border p-4 sm:p-5
        transition-colors duration-300
        ${
          active
            ? "border-(--brand)/40 bg-(--brand)/5"
            : "border-white/8 bg-white/2"
        }
      `}
    >
      {/* Top radial wash for active */}
      {active && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(70%_100%_at_50%_0%,rgba(255,140,66,0.10),transparent_70%)]"
        />
      )}

      {/* Header row */}
      <div className="relative flex items-start justify-between">
        <span
          className={`font-mono text-[11px] tracking-[0.28em] transition-colors duration-300 ${
            active ? "text-(--brand)" : "text-white/35"
          }`}
        >
          {number}
        </span>

        <span
          className={`
            flex h-8 w-8 items-center justify-center rounded-md border
            transition-all duration-300
            ${
              active
                ? "border-(--brand)/45 bg-(--brand)/12 text-(--brand-hover) shadow-[0_0_20px_-6px_var(--brand)]"
                : "border-white/8 bg-white/3 text-white/45"
            }
          `}
        >
          <HugeiconsIcon icon={icon} size={15} />
        </span>
      </div>

      {/* Title + description */}
      <h3
        className={`relative mt-4 font-mono text-[13px] font-medium tracking-[-0.005em] sm:text-[14px] ${
          active ? "text-white" : "text-white/85"
        }`}
      >
        {title}
      </h3>

      <p className="relative mt-1.5 font-mono text-[11px] leading-[1.65] text-white/50 sm:text-[12px]">
        {description}
      </p>

      {/* Status indicator */}
      <div className="relative mt-4 flex items-center gap-2">
        {active ? (
          <>
            <span className="relative flex h-1.5 w-1.5">
              <span className="flow-ping absolute inline-flex h-full w-full rounded-full bg-(--brand) opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-(--brand)" />
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-(--brand-hover)">
              Processing
            </span>
          </>
        ) : (
          <>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">
              Ready
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Connector — right arrow on desktop, down arrow stacked ────── */

function FlowConnector() {
  return (
    <div className="flex items-center justify-center lg:self-center">
      <span className="hidden h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[#0B0B0F] text-(--brand) lg:flex">
        <HugeiconsIcon icon={ArrowRight02Icon} size={12} />
      </span>

      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[#0B0B0F] text-(--brand) lg:hidden">
        <HugeiconsIcon icon={ArrowDown02Icon} size={12} />
      </span>
    </div>
  );
}
