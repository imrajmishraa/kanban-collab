import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  ArrowDown02Icon,
  ArrowRight02Icon,
  Cursor02Icon,
  FlashIcon,
  LayersIcon,
  RadarIcon,
  Refresh01Icon,
  ServerStack01Icon,
} from "@hugeicons/core-free-icons";

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

interface FlowStage {
  number: string;
  title: string;
  description: string;
  icon: IconSvgElement;
  active?: boolean;
}

interface EventItem {
  initials: string;
  name: string;
  color: string;
  action: string;
  task: string;
  time: string;
  status: "sent" | "synced" | "received";
}

interface PeerChip {
  initials: string;
  color: string;
  x: string;
  y: string;
  label: string;
}

/* ═══════════════════════════════════════════════════════════════
   SEEDED DATA
   ═══════════════════════════════════════════════════════════════ */

const FLOW_STAGES: FlowStage[] = [
  {
    number: "01",
    title: "User action",
    description: "A teammate moves a card, edits a task, or updates the board.",
    icon: Cursor02Icon,
  },
  {
    number: "02",
    title: "Synchronization",
    description:
      "The change travels through the collaboration layer in milliseconds.",
    icon: Refresh01Icon,
    active: true,
  },
  {
    number: "03",
    title: "Shared state",
    description:
      "Every connected client receives the update — one board, in sync.",
    icon: LayersIcon,
  },
];

const EVENTS: EventItem[] = [
  {
    initials: "RM",
    name: "Maya",
    color: "bg-(--brand)",
    action: "moved",
    task: "Auth flow → In progress",
    time: "just now",
    status: "received",
  },
  {
    initials: "RI",
    name: "Rio",
    color: "bg-sky-500",
    action: "edited",
    task: "Board layout",
    time: "12ms",
    status: "synced",
  },
  {
    initials: "SA",
    name: "Sam",
    color: "bg-pink-500",
    action: "completed",
    task: "Project init",
    time: "28ms",
    status: "sent",
  },
];

const PEERS: PeerChip[] = [
  { initials: "RM", color: "bg-(--brand)", x: "18%", y: "26%", label: "Maya" },
  { initials: "RI", color: "bg-sky-500", x: "62%", y: "42%", label: "Rio" },
  { initials: "SA", color: "bg-pink-500", x: "34%", y: "68%", label: "Sam" },
  {
    initials: "NV",
    color: "bg-emerald-500",
    x: "78%",
    y: "72%",
    label: "Noah",
  },
];

const TRANSPORT_STATS = [
  { label: "Protocol", value: "WS" },
  { label: "Latency", value: "42ms" },
  { label: "Peers", value: "04" },
];

/* ═══════════════════════════════════════════════════════════════
   ANIMATION
   ═══════════════════════════════════════════════════════════════ */

const SCENE_STYLES = `
  @keyframes flowPulse {
    0%, 100% { opacity: 0.35; }
    50%      { opacity: 1; }
  }
  @keyframes peerFloat {
    0%, 100% { transform: translate(0, 0); }
    50%      { transform: translate(6px, -4px); }
  }
  @keyframes dash {
    to { stroke-dashoffset: -20; }
  }
  .flow-pulse { animation: flowPulse 2.4s ease-in-out infinite; }
  .peer-float-a { animation: peerFloat 4.5s ease-in-out infinite; }
  .peer-float-b { animation: peerFloat 5.1s ease-in-out infinite 0.6s; }
  .peer-float-c { animation: peerFloat 4.8s ease-in-out infinite 1.2s; }
  .peer-float-d { animation: peerFloat 5.4s ease-in-out infinite 1.8s; }
  .flow-dash  { animation: dash 1.6s linear infinite; }

  @media (prefers-reduced-motion: reduce) {
    .flow-pulse, .peer-float-a, .peer-float-b, .peer-float-c, .peer-float-d, .flow-dash {
      animation: none !important;
    }
  }
`;

/* ═══════════════════════════════════════════════════════════════
   SECTION
   ═══════════════════════════════════════════════════════════════ */

export default function CollaborationFlowSection() {
  return (
    <section className="relative overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: SCENE_STYLES }} />

      {/* ═══════════════════════════════════════════════════════════
          BACKGROUND — dot-matrix pattern
          (dots only, no lines — different from the grid sections)
          ═══════════════════════════════════════════════════════════ */}

      {/* Dense fine dots */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.20) 0.9px, transparent 0.9px)",
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, #000 0%, transparent 82%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, #000 0%, transparent 82%)",
        }}
      />

      {/* Accent dots — larger grid, brand tint, offset */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,140,66,0.28) 1.4px, transparent 1.4px)",
          backgroundSize: "96px 96px",
          backgroundPosition: "36px 42px",
          maskImage:
            "radial-gradient(ellipse 60% 55% at 50% 40%, #000 0%, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 55% at 50% 40%, #000 0%, transparent 78%)",
        }}
      />

      {/* Bright accent nodes — sparse */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.55) 1.6px, transparent 1.6px)",
          backgroundSize: "192px 192px",
          backgroundPosition: "84px 108px",
          maskImage:
            "radial-gradient(ellipse 55% 45% at 50% 40%, #000 0%, transparent 72%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 55% 45% at 50% 40%, #000 0%, transparent 72%)",
        }}
      />

      {/* Single warm bloom, top-center */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -top-32 h-140 w-7xl -translate-x-1/2 rounded-[50%] bg-(--brand)/6 blur-[170px]"
      />

      {/* ═══════════════════════════════════════════════════════════
          CONTENT
          ═══════════════════════════════════════════════════════════ */}

      <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        {/* ── Header ──────────────────────────────────────────── */}
        <div className="max-w-2xl">
          <div className="eyebrow-orbit inline-flex items-center gap-3 rounded-full bg-[#08080C] px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.24em]">
            <span className="eyebrow-ring" aria-hidden="true" />

            <span className="relative z-2 flex items-center gap-3">
              <span className="text-(--brand)">04</span>
              <span aria-hidden="true" className="h-px w-6 bg-white/20" />
              <span className="text-white/85">Collaboration flow</span>
            </span>
          </div>

          <h2 className="mt-8 font-mono text-[1.75rem] font-normal leading-[1.05] tracking-[-0.03em] text-white sm:text-[2.25rem] lg:text-[2.5rem]">
            One shared state.
            <br />
            <span className="text-white/35">Everyone stays in sync.</span>
          </h2>

          <p className="mt-6 max-w-sm font-mono text-[13px] leading-[1.85] text-white/55 sm:text-[14px]">
            When someone changes the board, that change propagates through the
            collaboration layer and reaches every connected client in
            milliseconds.
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            FLOW SCENE
            ═══════════════════════════════════════════════════════════ */}

        <div className="relative mt-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-10 -bottom-12 -top-8 rounded-[50%] bg-(--brand)/6 blur-[130px]"
          />

          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#08080C] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.85)] sm:rounded-2xl">
            <FlowScene />
          </div>

          <div className="mt-3 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-white/35 sm:mt-4 sm:tracking-[0.24em]">
            <span>Fig. 04 — Collaboration flow</span>
            <span>Step 04 / 04</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FLOW SCENE
   Chrome · connection strip · flow stages · live event timeline
   ═══════════════════════════════════════════════════════════════ */

function FlowScene() {
  return (
    <div className="relative">
      {/* ── Chrome bar ──────────────────────────────────────── */}
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
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          <span className="hidden sm:inline">Streaming</span>
          <span className="sm:hidden">Live</span>
        </span>
      </div>

      {/* ── Connection strip — protocol stats ───────────────── */}
      <div className="flex items-center gap-3 border-b border-white/6 px-3 py-2.5 sm:gap-5 sm:px-4 sm:py-3 lg:px-5">
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 sm:text-[11px]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
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

      {/* ── Flow stages — 3 numbered nodes with connectors ────── */}
      <div className="border-b border-white/6 p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch lg:gap-3">
          {FLOW_STAGES.map((stage, i) => (
            <>
              <FlowStageCard key={stage.number} {...stage} />

              {i < FLOW_STAGES.length - 1 && (
                <FlowConnector key={`conn-${i}`} />
              )}
            </>
          ))}
        </div>
      </div>

      {/* ── Live propagation split ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px]">
        {/* Left: mini board with peers */}
        <div className="border-b border-white/6 p-4 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={RadarIcon}
                size={13}
                className="text-(--brand)"
              />
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45 sm:text-[11px]">
                Live peers
              </span>
            </div>
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/30 sm:text-[10px]">
              4 connected
            </span>
          </div>

          {/* Peer field */}
          <div className="relative aspect-video overflow-hidden rounded-lg border border-white/6 bg-[#050507]">
            {/* Dotted grid inside */}
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-50"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.10) 0.7px, transparent 0.7px)",
                backgroundSize: "24px 24px",
                maskImage:
                  "radial-gradient(ellipse 80% 80% at 50% 50%, #000 0%, transparent 88%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 80% 80% at 50% 50%, #000 0%, transparent 88%)",
              }}
            />

            {/* Center node — sync server */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-(--brand)/40 bg-(--brand)/10">
                <span className="absolute inset-0 animate-ping rounded-full border border-(--brand)/25" />
                <span className="absolute -inset-2 rounded-full border border-(--brand)/10" />
                <HugeiconsIcon
                  icon={ServerStack01Icon}
                  size={20}
                  className="text-(--brand)"
                />
              </div>
            </div>

            {/* SVG connectors — lines from center to peers */}
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {PEERS.map((peer) => {
                const px = parseFloat(peer.x);
                const py = parseFloat(peer.y);
                return (
                  <line
                    key={peer.initials}
                    x1="50"
                    y1="50"
                    x2={px}
                    y2={py}
                    stroke="var(--brand)"
                    strokeWidth="0.25"
                    strokeDasharray="1.5 2"
                    opacity="0.4"
                    className="flow-dash"
                  />
                );
              })}
            </svg>

            {/* Peer chips */}
            {PEERS.map((peer, i) => {
              const floatClass = [
                "peer-float-a",
                "peer-float-b",
                "peer-float-c",
                "peer-float-d",
              ][i];

              return (
                <div
                  key={peer.initials}
                  className={`absolute ${floatClass}`}
                  style={{ left: peer.x, top: peer.y }}
                >
                  <div className="-translate-x-1/2 -translate-y-1/2">
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#050507] font-mono text-[9px] text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] ${peer.color}`}
                      >
                        {peer.initials}
                      </span>
                      <span className="rounded-full border border-white/10 bg-[#0B0B0F]/90 px-2 py-0.5 font-mono text-[9px] text-white/70 backdrop-blur-sm">
                        {peer.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: event timeline */}
        <div className="p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={FlashIcon}
                size={13}
                className="text-(--brand)"
              />
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45 sm:text-[11px]">
                Propagation log
              </span>
            </div>
            <span className="font-mono text-[9px] text-white/30 sm:text-[10px]">
              realtime
            </span>
          </div>

          <ul className="space-y-2">
            {EVENTS.map((event, i) => (
              <EventRow key={i} {...event} />
            ))}
          </ul>

          {/* Live status footer */}
          <div className="mt-4 flex items-center gap-2 rounded-md border border-white/6 bg-white/2 px-3 py-2">
            <span className="flow-pulse h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="font-mono text-[10px] text-white/55">
              Listening for changes
            </span>
            <span className="ml-auto flex items-center gap-0.5">
              <span className="h-1 w-1 animate-pulse rounded-full bg-white/40 [animation-delay:0ms]" />
              <span className="h-1 w-1 animate-pulse rounded-full bg-white/40 [animation-delay:150ms]" />
              <span className="h-1 w-1 animate-pulse rounded-full bg-white/40 [animation-delay:300ms]" />
            </span>
          </div>
        </div>
      </div>

      {/* ── Footer meta ────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 border-t border-white/6 px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-white/30 sm:px-4 sm:py-3 sm:tracking-[0.24em] lg:px-5">
        <span className="truncate">Propagation · 1 → N</span>
        <span className="shrink-0 tabular-nums">04 / 04</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FLOW STAGE CARD — numbered node in the pipeline
   ═══════════════════════════════════════════════════════════════ */

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
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--brand) opacity-70" />
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

/* ═══════════════════════════════════════════════════════════════
   FLOW CONNECTOR — arrow between stages
   ═══════════════════════════════════════════════════════════════ */

function FlowConnector() {
  return (
    <div className="flex items-center justify-center lg:self-center">
      {/* Desktop: right arrow */}
      <span className="hidden h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[#0B0B0F] text-(--brand) lg:flex">
        <HugeiconsIcon icon={ArrowRight02Icon} size={12} />
      </span>

      {/* Mobile: down arrow */}
      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[#0B0B0F] text-(--brand) lg:hidden">
        <HugeiconsIcon icon={ArrowDown02Icon} size={12} />
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EVENT ROW — one row in the propagation log
   ═══════════════════════════════════════════════════════════════ */

function EventRow({
  initials,
  name,
  color,
  action,
  task,
  time,
  status,
}: EventItem) {
  const statusStyles: Record<string, string> = {
    sent: "text-amber-400/80 border-amber-400/25 bg-amber-400/8",
    synced: "text-sky-400/80 border-sky-400/25 bg-sky-400/8",
    received: "text-emerald-400/80 border-emerald-400/25 bg-emerald-400/8",
  };

  const statusLabels: Record<string, string> = {
    sent: "Sent",
    synced: "Synced",
    received: "Received",
  };

  return (
    <li className="flex items-start gap-2.5 rounded-md border border-white/6 bg-white/2 p-2.5">
      {/* Avatar */}
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 font-mono text-[9px] text-white ${color}`}
      >
        {initials}
      </span>

      {/* Body */}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-mono text-[11px] leading-[1.4] text-white/85">
          <span className="text-white/60">{name}</span> {action}{" "}
          <span className="text-white/70">{task}</span>
        </span>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-mono text-[9px] text-white/30">{time}</span>
          <span
            className={`rounded border px-1.5 py-px font-mono text-[8px] uppercase tracking-[0.12em] ${statusStyles[status]}`}
          >
            {statusLabels[status]}
          </span>
        </div>
      </div>
    </li>
  );
}
