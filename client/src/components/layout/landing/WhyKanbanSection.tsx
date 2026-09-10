import {
  DashboardSquare01Icon,
  UserGroupIcon,
  Rocket01Icon,
} from "@hugeicons/core-free-icons";
import WhyCard from "./WhyCard";


const features = [
  {
    number: "01",
    icon: DashboardSquare01Icon,
    title: "Organize",
    description: "Structure that stays out of the way.",
    visual: "board" as const,
  },
  {
    number: "02",
    icon: UserGroupIcon,
    title: "Collaborate",
    description: "Everyone sees the same board, live.",
    visual: "cursors" as const,
  },
  {
    number: "03",
    icon: Rocket01Icon,
    title: "Move Faster",
    description: "Spot blockers before they cost you.",
    visual: "velocity" as const,
  },
];

const stats = [
  { value: "< 50ms", label: "Sync latency" },
  { value: "∞", label: "Boards" },
  { value: "100%", label: "Open source" },
];

export default function WhyKanbanSection() {
  return (
    <section className="relative overflow-hidden border-b border-(--border)">
      {/* Ambient warm glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -top-80 h-140 w-275 -translate-x-1/2 rounded-[50%] bg-(--brand)/8 blur-[150px]"
      />

      {/* Masked grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse 65% 60% at 50% 30%, #000 0%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 65% 60% at 50% 30%, #000 0%, transparent 80%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        {/* ── Kicker ────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/3 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-(--text-secondary) backdrop-blur-xl backdrop-saturate-150">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--brand) opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-(--brand)" />
            </span>
            <span>Why Kanban</span>
          </span>
        </div>

        {/* ── Heading + stats on one row ────────────────────────── */}
        <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-mono text-3xl font-medium leading-[1.08] tracking-[-0.04em] text-(--text-primary) sm:text-4xl lg:text-5xl">
              Work should move{" "}
              <span className="bg-linear-to-b from-(--brand-hover) via-(--brand) to-(--brand-hover)/70 bg-clip-text text-transparent">
                forward.
              </span>
            </h2>
          </div>

          {/* Stats — right-aligned horizontal strip */}
          <div className="flex items-stretch gap-6 border-l border-white/[0.06] pl-6 lg:gap-8 lg:pl-8">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`flex flex-col ${
                  i !== 0 ? "border-l border-white/[0.06] pl-6 lg:pl-8" : ""
                }`}
              >
                <span className="font-mono text-lg font-medium tracking-tight text-(--text-primary) sm:text-xl">
                  {stat.value}
                </span>
                <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-(--text-secondary)/60">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bento cards ───────────────────────────────────────── */}
        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <WhyCard key={feature.number} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
