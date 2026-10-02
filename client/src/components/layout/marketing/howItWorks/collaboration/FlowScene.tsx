import FlowPipeline from "./FlowPipeline";
import PeerField from "./PeerField";
import PropagationLog from "./PropagationLog";
import { TRANSPORT_STATS } from "./flowData";

/* ═══════════════════════════════════════════════════════════════
   FLOW SCENE — the app window
   Chrome bar · connection strip · pipeline · live split · footer
   ═══════════════════════════════════════════════════════════════ */

export default function FlowScene() {
  return (
    <div className="relative">
      <ChromeBar />
      <ConnectionStrip />

      {/* Pipeline — the three numbered nodes */}
      <FlowPipeline />

      {/* Live propagation split */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px]">
        <PeerField />
        <PropagationLog />
      </div>

      <FooterMeta />
    </div>
  );
}

/* ── Window chrome bar ─────────────────────────────────────────── */

function ChromeBar() {
  return (
    <div className="flex h-10 items-center justify-between border-b border-white/6 px-3 sm:h-11 sm:px-4 lg:h-12 lg:px-5">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1 sm:gap-1.5">
          <span className="h-2 w-2 rounded-full border border-rose-500/70 bg-rose-500/10 sm:h-2.5 sm:w-2.5" />
          <span className="h-2 w-2 rounded-full border border-yellow-500/70 bg-yellow-500/10 sm:h-2.5 sm:w-2.5" />
          <span className="h-2 w-2 rounded-full border border-emerald-500/70 bg-emerald-500/10 sm:h-2.5 sm:w-2.5" />
        </div>
        <span className="truncate font-mono text-[10px] tracking-wider text-white/55 sm:text-[11px] lg:text-[12px]">
          collaboration / propagation
        </span>
      </div>

      <span className="flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/8 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-emerald-400 sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-[10px]">
        <span className="relative flex h-1.5 w-1.5">
          <span className="flow-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
        <span className="hidden sm:inline">Streaming</span>
        <span className="sm:hidden">Live</span>
      </span>
    </div>
  );
}

/* ── Connection strip — protocol stats ─────────────────────────── */

function ConnectionStrip() {
  return (
    <div className="flex items-center gap-3 border-b border-white/6 px-3 py-2.5 sm:gap-5 sm:px-4 sm:py-3 lg:px-5">
      <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 sm:text-[11px]">
        <span className="relative flex h-1.5 w-1.5">
          <span className="flow-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
        <span>Connected</span>
      </span>

      <span aria-hidden="true" className="h-3 w-px bg-white/10" />

      <div className="flex items-center gap-3 sm:gap-5">
        {TRANSPORT_STATS.map((stat) => (
          <span key={stat.label} className="flex items-baseline gap-1.5">
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/30 sm:text-[10px]">
              {stat.label}
            </span>
            <span className="font-mono text-[11px] font-medium tracking-tight text-white/85 sm:text-[12px]">
              {stat.value}
            </span>
          </span>
        ))}
      </div>

      <span className="ml-auto hidden font-mono text-[10px] uppercase tracking-[0.18em] text-white/25 sm:inline">
        socket://sync
      </span>
    </div>
  );
}

/* ── Footer meta ───────────────────────────────────────────────── */

function FooterMeta() {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-white/6 px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-white/30 sm:px-4 sm:py-3 sm:tracking-[0.24em] lg:px-5">
      <span className="truncate">Propagation · 1 → N</span>
      <span className="shrink-0 tabular-nums">04 / 04</span>
    </div>
  );
}
