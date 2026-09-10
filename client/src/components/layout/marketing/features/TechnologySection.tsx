import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  ComputerIcon,
  FlashIcon,
  Database01Icon,
  Link01Icon,
} from "@hugeicons/core-free-icons";

export interface Technology {
  name: string;
  role: string;
  description: string;
}

const technologies: Technology[] = [
  {
    name: "React",
    role: "Frontend",
    description:
      "A responsive interface for boards, workspaces, and everyday project workflows.",
  },
  {
    name: "TypeScript",
    role: "Language",
    description:
      "Strong typing across the application to keep the codebase predictable.",
  },
  {
    name: "WebSockets",
    role: "Transport",
    description:
      "Persistent connections that let connected clients talk to the collaboration server.",
  },
  {
    name: "Yjs",
    role: "Collaboration",
    description:
      "CRDT-based shared state that lets concurrent changes sync without conflict.",
  },
  {
    name: "MongoDB",
    role: "Persistence",
    description:
      "Durable storage for application data and collaboration state.",
  },
  {
    name: "Redis",
    role: "Infrastructure",
    description: "Fast coordination and messaging for the real-time layer.",
  },
];

const architectureLayers = [
  {
    number: "01",
    label: "Client",
    icon: ComputerIcon,
    hint: "Browser · UI",
    technologies: ["React", "TypeScript"],
  },
  {
    number: "02",
    label: "Real-time",
    icon: FlashIcon,
    hint: "Sync · Presence",
    technologies: ["WebSockets", "Yjs"],
  },
  {
    number: "03",
    label: "Data & Infra",
    icon: Database01Icon,
    hint: "Storage · Coordination",
    technologies: ["MongoDB", "Redis"],
  },
];

const runtimeStats = [
  { label: "Layers", value: "03" },
  { label: "Technologies", value: "06" },
  { label: "Open source", value: "100%" },
  { label: "License", value: "MIT" },
];

export default function TechnologySection() {
  return (
    <section className="relative overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════
          AMBIENT LIGHT
          ═══════════════════════════════════════════════════════════ */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -top-[420px] h-[760px] w-[1400px] -translate-x-1/2 rounded-[50%] bg-(--brand)/[0.09] blur-[170px]"
      />

      {/* Cool wash, left side */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-260px] top-[280px] h-[520px] w-[720px] rounded-[50%] bg-white/[0.018] blur-[140px]"
      />

      {/* Warm echo, bottom-right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-180px] right-[-200px] h-[500px] w-[700px] rounded-[50%] bg-(--brand)/[0.05] blur-[150px]"
      />

      {/* ═══════════════════════════════════════════════════════════
          STARFIELD
          ═══════════════════════════════════════════════════════════ */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.35) 0.6px, transparent 0.6px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, #000 0%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, #000 0%, transparent 85%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.5) 0.8px, transparent 0.8px)",
          backgroundSize: "44px 44px",
          backgroundPosition: "12px 18px",
          maskImage:
            "radial-gradient(ellipse 65% 55% at 45% 45%, #000 0%, transparent 82%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 65% 55% at 45% 45%, #000 0%, transparent 82%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--brand) 1px, transparent 1px)",
          backgroundSize: "110px 110px",
          backgroundPosition: "30px 40px",
          maskImage:
            "radial-gradient(ellipse 60% 50% at 55% 40%, #000 0%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 50% at 55% 40%, #000 0%, transparent 80%)",
        }}
      />

      {/* ═══════════════════════════════════════════════════════════
          CONTENT
          ═══════════════════════════════════════════════════════════ */}
      <div className="relative mx-auto w-full max-w-7xl px-4 py-28 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        {/* ── Header: left-aligned like a spec sheet ─────────── */}
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-[11px] tracking-[0.28em] text-(--brand)">
                05
              </span>
              <span
                aria-hidden="true"
                className="h-px w-12 opacity-70"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, var(--brand) 1px, transparent 1px)",
                  backgroundSize: "4px 1px",
                  backgroundRepeat: "repeat-x",
                }}
              />
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-(--text-secondary)/60">
                Technology
              </span>
            </div>

            <h2 className="mt-6 font-mono text-3xl font-medium leading-[1.08] tracking-[-0.04em] text-(--text-primary) sm:text-4xl lg:text-5xl">
              Built on technology{" "}
              <span className="bg-linear-to-b from-(--brand-hover) via-(--brand) to-(--brand-hover)/70 bg-clip-text text-transparent">
                that scales with the work.
              </span>
            </h2>

            <p className="mt-6 max-w-xl font-mono text-sm leading-[1.9] text-(--text-secondary) sm:text-[15px]">
              A modern frontend, a real-time collaboration layer, and reliable
              infrastructure — coordinated to keep work synchronized.
            </p>
          </div>

          {/* Right: spec footer */}
          <div className="flex items-center gap-4 lg:pb-2">
            <span
              aria-hidden="true"
              className="hidden h-px w-12 bg-white/[0.08] lg:block"
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--text-secondary)/55">
              Stack v0.1.0
            </span>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            ARCHITECTURE PIPELINE
            ═══════════════════════════════════════════════════════════ */}
        <div className="relative mt-16">
          {/* Ambient bloom under the pipeline */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-16 -bottom-10 top-12 rounded-[40%] bg-(--brand)/[0.08] blur-[120px]"
          />

          <div
            className="
              relative rounded-[24px]
              border border-white/[0.10]
              bg-white/[0.03]
              p-2
              shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_30px_80px_-20px_rgba(0,0,0,0.6)]
              backdrop-blur-xl backdrop-saturate-150
            "
          >
            {/* Radial top wash */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(255,255,255,0.06),transparent_70%)]"
            />

            <div className="relative overflow-hidden rounded-[18px] border border-white/[0.05] bg-[#0B0B0F]">
              {/* Window header */}
              <div className="flex h-11 items-center justify-between border-b border-white/[0.04] px-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full border border-rose-500/70 bg-rose-500/10" />
                    <span className="h-2.5 w-2.5 rounded-full border border-yellow-500/70 bg-yellow-500/10" />
                    <span className="h-2.5 w-2.5 rounded-full border border-emerald-500/70 bg-emerald-500/10" />
                  </div>
                  <span className="font-mono text-[11px] tracking-[0.05em] text-(--text-secondary)">
                    kanban / architecture
                  </span>
                </div>

                <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.15em] text-(--text-secondary)/55">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  system://ready
                </span>
              </div>

              {/* Pipeline body */}
              <div className="relative p-6 sm:p-8">
                {/* Horizontal flow line behind the layer cards */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-[16%] right-[16%] top-1/2 hidden h-px lg:block"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.10) 20%, rgba(255,255,255,0.10) 80%, transparent)",
                  }}
                />

                {/* Animated flow dots traveling along the line */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-[16%] right-[16%] top-1/2 hidden h-px overflow-hidden lg:block"
                >
                  <span className="absolute left-0 top-1/2 h-1 w-1 -translate-y-1/2 animate-[flow_6s_linear_infinite] rounded-full bg-(--brand) shadow-[0_0_8px_var(--brand)]" />
                  <span className="absolute left-0 top-1/2 h-1 w-1 -translate-y-1/2 animate-[flow_6s_linear_infinite_2s] rounded-full bg-(--brand)/60 shadow-[0_0_6px_var(--brand)]" />
                  <span className="absolute left-0 top-1/2 h-1 w-1 -translate-y-1/2 animate-[flow_6s_linear_infinite_4s] rounded-full bg-(--brand)/40" />
                </div>

                {/* Three layers */}
                <div className="relative grid gap-6 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center lg:gap-3">
                  {architectureLayers.map((layer, i) => (
                    <>
                      {/* Layer card */}
                      <div
                        key={layer.number}
                        className="
                          group/layer relative overflow-hidden rounded-xl
                          border border-white/[0.08]
                          bg-[#0F0F12]
                          p-5
                          transition-all duration-500
                          hover:border-(--brand)/40
                          hover:bg-[#111116]
                        "
                      >
                        {/* Top radial accent */}
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(255,255,255,0.05),transparent_70%)]"
                        />

                        {/* Header row */}
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="
                                flex h-8 w-8 items-center justify-center rounded-lg
                                border border-white/[0.08]
                                bg-linear-to-b from-white/[0.05] to-white/[0.01]
                                text-(--brand)
                                shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
                              "
                            >
                              <HugeiconsIcon icon={layer.icon} size={14} />
                            </span>
                            <div className="flex flex-col">
                              <span className="font-mono text-[10px] tracking-[0.28em] text-(--brand)">
                                {layer.number}
                              </span>
                              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-(--text-secondary)/50">
                                {layer.hint}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Layer label */}
                        <h3 className="relative mt-4 font-mono text-base font-medium tracking-[-0.01em] text-(--text-primary)">
                          {layer.label}
                        </h3>

                        {/* Tech chips inside the layer */}
                        <div className="relative mt-3.5 flex flex-wrap gap-1.5">
                          {layer.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="
                                rounded-md border border-white/[0.07]
                                bg-white/[0.03]
                                px-2 py-0.5
                                font-mono text-[10px] tracking-[0.05em] text-(--text-secondary)
                                backdrop-blur-sm
                              "
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Arrow between layers */}
                      {i < architectureLayers.length - 1 && (
                        <div
                          key={`arrow-${i}`}
                          className="relative flex items-center justify-center"
                          aria-hidden="true"
                        >
                          {/* Desktop: horizontal arrow */}
                          <span className="hidden h-6 w-6 items-center justify-center rounded-full border border-white/[0.08] bg-[#0B0B0F] text-(--text-secondary)/60 lg:flex">
                            <HugeiconsIcon icon={ArrowRight01Icon} size={10} />
                          </span>

                          {/* Mobile: rotated arrow */}
                          <span className="flex h-6 w-6 rotate-90 items-center justify-center rounded-full border border-white/[0.08] bg-[#0B0B0F] text-(--text-secondary)/60 lg:hidden">
                            <HugeiconsIcon icon={ArrowRight01Icon} size={10} />
                          </span>
                        </div>
                      )}
                    </>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            TECHNOLOGY SPEC GRID
            ═══════════════════════════════════════════════════════════ */}

        {/* Data grid header */}
        <div className="mt-20 flex items-end justify-between border-b border-white/[0.06] pb-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-(--text-secondary)/60">
            Component Index
          </span>
          <span className="font-mono text-[10px] tracking-[0.15em] text-(--text-secondary)/40">
            06 items
          </span>
        </div>

        {/* Six tech cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {technologies.map((tech, i) => (
            <div
              key={tech.name}
              className="
                group/tech relative overflow-hidden rounded-2xl
                border border-white/[0.07]
                bg-white/[0.02]
                p-5
                shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]
                backdrop-blur-xl backdrop-saturate-150
                transition-all duration-500
                hover:-translate-y-0.5
                hover:border-white/[0.14]
                hover:bg-white/[0.035]
                hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_20px_48px_-24px_rgba(0,0,0,0.7)]
              "
            >
              {/* Radial top wash */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(255,255,255,0.05),transparent_70%)]"
              />

              {/* Index marker */}
              <div className="relative flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-[0.28em] text-(--text-secondary)/45">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <span className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-(--brand)/60" />
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-(--brand)/80">
                    {tech.role}
                  </span>
                </span>
              </div>

              {/* Name */}
              <h3 className="relative mt-4 font-mono text-lg font-medium tracking-[-0.01em] text-(--text-primary)">
                {tech.name}
              </h3>

              {/* Description */}
              <p className="relative mt-2 font-mono text-[12px] leading-[1.75] text-(--text-secondary)/85">
                {tech.description}
              </p>

              {/* Dotted footer trail */}
              <div className="relative mt-5 flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-px flex-1 opacity-50"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)",
                    backgroundSize: "5px 1px",
                    backgroundRepeat: "repeat-x",
                  }}
                />
                <HugeiconsIcon
                  icon={Link01Icon}
                  size={10}
                  className="text-(--text-secondary)/40 transition-colors duration-500 group-hover/tech:text-(--brand)/80"
                />
              </div>
            </div>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════
            RUNTIME STATS STRIP
            ═══════════════════════════════════════════════════════════ */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-5 sm:gap-x-16">
          {runtimeStats.map((stat) => (
            <div key={stat.label} className="flex items-baseline gap-2.5">
              <span className="font-mono text-xl font-medium tracking-tight tabular-nums text-(--text-primary)">
                {stat.value}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--text-secondary)/55">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Add the flow keyframe via inline style — or put it in style.css */}
      <style>{`
        @keyframes flow {
          0%   { left: 0%; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
      `}</style>
    </section>
  );
}
