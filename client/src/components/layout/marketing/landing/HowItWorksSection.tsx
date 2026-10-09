import { HugeiconsIcon } from "@hugeicons/react";
import {
  ChartLineData01Icon,
  Rocket01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

import { Reveal, SectionHeading, TiltCard } from "./Tilt";

const steps = [
  {
    n: "01",
    icon: Rocket01Icon,
    title: "Create your board",
    body: "Start from a blank canvas or a ready-made template. Columns, labels and priorities are yours to shape in seconds.",
  },
  {
    n: "02",
    icon: UserGroupIcon,
    title: "Invite your team",
    body: "Share one link. Teammates join the same board and see every move the instant it happens — cursors, cards and all.",
  },
  {
    n: "03",
    icon: ChartLineData01Icon,
    title: "Drag work to Done",
    body: "Flow becomes visible. Cards tell you where work stalls, and the insights tab turns that motion into numbers you can act on.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="relative bg-transparent">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title={
            <>
              From zero to a flowing board
              <br />
              in{" "}
              <span className="bg-linear-to-b from-(--brand-hover) to-(--brand) bg-clip-text text-transparent">
                three moves
              </span>
            </>
          }
          description="No onboarding maze, no config sprawl. Create, invite, drag — the rest is the product doing its job."
        />

        <div className="relative mt-16 grid gap-6 md:grid-cols-3">
          {/* Connector line — runs through the step badges, visible in the gaps */}

          {steps.map((step, i) => (
            <Reveal key={step.n} delay={i * 0.14} className="h-full">
              <TiltCard intensity={10} className="h-full">
                {/* ── Glass card ─────────────────────────────────── */}
                <div
                  className="
                    relative flex h-full flex-col rounded-2xl
                    border border-white/8
                    bg-white/3
                    p-6 pt-9
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_50px_-20px_rgba(0,0,0,0.6)]
                    backdrop-blur-xl backdrop-saturate-150
                    transition-colors duration-300
                    hover:border-white/16
                  "
                >
                  <span
                    className="
                      inline-flex size-11 shrink-0 items-center justify-center rounded-xl
                      border border-white/8 bg-white/4
                      text-(--brand-hover)
                      shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
                    "
                  >
                    <HugeiconsIcon icon={step.icon} size={20} strokeWidth={2} />
                  </span>

                  <h3 className="mt-5 font-mono text-base font-medium tracking-tight text-(--text-primary)">
                    {step.title}
                  </h3>

                  <p className="mt-3 font-mono text-xs leading-[1.9] text-(--text-secondary)">
                    {step.body}
                  </p>

                  {/* Footer rule — pinned to the bottom so all three cards align */}
                  <span aria-hidden className="mt-auto block pt-6">
                    <span className="block h-px w-full bg-linear-to-r from-(--brand)/35 to-transparent" />
                  </span>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
