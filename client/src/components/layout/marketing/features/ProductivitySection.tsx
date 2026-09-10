import { ProductivityPoint } from "@components/ui/marketing/features/ProductivityPoint";
import { ProductivityTask } from "@components/ui/marketing/features/ProductivityTask";

export default function ProductivitySection() {
  return (
    <section className="relative overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════
          AMBIENT LIGHT
          ═══════════════════════════════════════════════════════════ */}

      {/* Warm bloom, top-center */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -top-[420px] h-[760px] w-[1400px] -translate-x-1/2 rounded-[50%] bg-(--brand)/[0.09] blur-[170px]"
      />

      {/* Cool wash, bottom-right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-200px] right-[-240px] h-[540px] w-[780px] rounded-[50%] bg-white/[0.018] blur-[140px]"
      />

      {/* ═══════════════════════════════════════════════════════════
          STARFIELD — three dot layers at different densities
          ═══════════════════════════════════════════════════════════ */}

      {/* Layer 1 — tiny dots, dense */}
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

      {/* Layer 2 — small dots, offset grid for organic feel */}
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

      {/* Layer 3 — sparse brand-colored stars */}
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

      {/* Layer 4 — a few brighter accent stars, very sparse */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.7) 1.2px, transparent 1.2px)",
          backgroundSize: "180px 180px",
          backgroundPosition: "60px 90px",
          maskImage:
            "radial-gradient(ellipse 55% 45% at 50% 40%, #000 0%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 55% 45% at 50% 40%, #000 0%, transparent 75%)",
        }}
      />

      {/* ═══════════════════════════════════════════════════════════
          CONTENT
          ═══════════════════════════════════════════════════════════ */}
      <div className="relative mx-auto w-full max-w-7xl px-4 py-28 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
          {/* ── Left: Content ──────────────────────────────────── */}
          <div>
            {/* Kicker — dotted trail */}
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-[11px] tracking-[0.28em] text-(--brand)">
                03
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
                Productivity
              </span>
            </div>

            {/* Headline */}
            <h2 className="mt-6 font-mono text-3xl font-medium leading-[1.08] tracking-[-0.04em] text-(--text-primary) sm:text-4xl lg:text-5xl">
              Keep work{" "}
              <span className="bg-linear-to-b from-(--brand-hover) via-(--brand) to-(--brand-hover)/70 bg-clip-text text-transparent">
                moving forward.
              </span>
            </h2>

            {/* Description */}
            <p className="mt-6 max-w-xl font-mono text-sm leading-[1.9] text-(--text-secondary) sm:text-[15px]">
              Make priorities visible, keep deadlines in sight, and spend less
              time figuring out what to work on next.
            </p>

            {/* Feature points — dotted dividers, no border box */}
            <div className="relative mt-12">
              {[
                {
                  number: "01",
                  title: "Clear priorities",
                  description:
                    "Understand what needs attention without digging through your workspace.",
                },
                {
                  number: "02",
                  title: "Visible deadlines",
                  description:
                    "Keep important dates connected to the work that needs to get done.",
                },
                {
                  number: "03",
                  title: "Focused workflow",
                  description:
                    "Move tasks through a simple workflow designed to reduce unnecessary friction.",
                },
              ].map((point, i, arr) => (
                <div key={point.number} className="relative">
                  <ProductivityPoint
                    number={point.number}
                    title={point.title}
                    description={point.description}
                  />

                  {/* Dotted divider between points */}
                  {i < arr.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none block h-px opacity-50"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle, rgba(255,255,255,0.20) 1px, transparent 1px)",
                        backgroundSize: "6px 1px",
                        backgroundRepeat: "repeat-x",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Productivity interface ──────────────────── */}
          <div className="relative">
            {/* Ambient warm bloom under the frame */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-10 -bottom-10 top-16 rounded-[40%] bg-(--brand)/[0.10] blur-[110px]"
            />

            {/* Glass outer frame */}
            <div
              className="
                group/frame relative rounded-[24px]
                border border-white/[0.10]
                bg-white/[0.03]
                p-2
                shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_30px_80px_-20px_rgba(0,0,0,0.6)]
                backdrop-blur-xl backdrop-saturate-150
                transition-all duration-500
                hover:border-white/[0.16]
                hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_40px_100px_-20px_rgba(0,0,0,0.7)]
              "
            >
              {/* Radial top wash */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(255,255,255,0.06),transparent_70%)]"
              />

              {/* Inner window */}
              <div
                className="
                  relative overflow-hidden rounded-[18px]
                  border border-white/[0.05]
                  bg-[#0B0B0F]
                  shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]
                "
              >
                {/* ── Window header ─────────────────────────── */}
                <div className="flex h-11 items-center justify-between border-b border-white/[0.04] px-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full border border-rose-500/70 bg-rose-500/10" />
                      <span className="h-2.5 w-2.5 rounded-full border border-yellow-500/70 bg-yellow-500/10" />
                      <span className="h-2.5 w-2.5 rounded-full border border-emerald-500/70 bg-emerald-500/10" />
                    </div>
                    <span className="font-mono text-[11px] tracking-[0.05em] text-(--text-secondary)">
                      workspace / overview
                    </span>
                  </div>

                  <span className="font-mono text-[10px] tracking-[0.15em] text-(--text-secondary)/55">
                    07 tasks
                  </span>
                </div>

                {/* ── Toolbar — glass filter chips ──────────── */}
                <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.04] p-3">
                  <span className="rounded-full border border-(--brand)/40 bg-(--brand)/10 px-3 py-1.5 font-mono text-[10px] text-(--brand-hover) backdrop-blur-sm">
                    All
                  </span>

                  <span className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 font-mono text-[10px] text-(--text-secondary)/70 backdrop-blur-sm transition-colors duration-200 hover:border-white/[0.14] hover:text-(--text-secondary)">
                    Assigned
                  </span>

                  <span className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 font-mono text-[10px] text-(--text-secondary)/70 backdrop-blur-sm transition-colors duration-200 hover:border-white/[0.14] hover:text-(--text-secondary)">
                    Due soon
                  </span>

                  <span className="ml-auto hidden items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] text-(--text-secondary)/40 sm:flex">
                    <span className="h-1 w-1 rounded-full bg-(--brand)/50" />
                    filter://active
                  </span>
                </div>

                {/* ── Task list ─────────────────────────────── */}
                <div className="divide-y divide-white/[0.04]">
                  <ProductivityTask
                    title="Finalize workspace layout"
                    status="IN PROGRESS"
                    priority="HIGH"
                    due="Today"
                  />
                  <ProductivityTask
                    title="Review authentication flow"
                    status="TODO"
                    priority="MEDIUM"
                    due="Tomorrow"
                  />
                  <ProductivityTask
                    title="Implement board filtering"
                    status="TODO"
                    priority="LOW"
                    due="Aug 19"
                  />
                  <ProductivityTask
                    title="Connect collaboration state"
                    status="DONE"
                    priority="HIGH"
                    due="Completed"
                  />
                </div>

                {/* ── Footer ────────────────────────────────── */}
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--text-secondary)/55">
                    Workspace overview
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.1em] text-(--text-secondary)/40">
                    tasks://07
                  </span>
                </div>
              </div>
            </div>

            {/* Under-frame reflection */}
            <div
              aria-hidden="true"
              className="pointer-events-none mx-auto mt-3 h-8 w-4/5 rounded-[50%] bg-white/[0.025] blur-3xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
