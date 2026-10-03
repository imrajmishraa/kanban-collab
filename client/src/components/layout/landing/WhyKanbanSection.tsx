import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform,
  type Variants,
} from "framer-motion";
import {
  DashboardSquare01Icon,
  UserGroupIcon,
  Rocket01Icon,
} from "@hugeicons/core-free-icons";

import WhyCard from "./WhyCard";
import { Reveal } from "./Tilt";

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

/* ── Stat value that counts up when scrolled into view ─────────── */

function StatValue({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  /* "< 50ms" → prefix "< ", number 50, suffix "ms". "∞" stays static. */
  const match = value.match(/^([^\d]*)(\d+)(.*)$/);

  const count = useMotionValue(0);
  const text = useTransform(
    count,
    (v) => `${match?.[1] ?? ""}${Math.round(v)}${match?.[3] ?? ""}`,
  );

  useEffect(() => {
    if (!inView || !match) return;
    const controls = animate(count, Number(match[2]), {
      duration: 1.4,
      ease: [0.21, 0.47, 0.32, 0.98],
    });
    return () => controls.stop();
  }, [inView, count, match]);

  if (!match) {
    return (
      <motion.span
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="block"
        ref={ref}
      >
        {value}
      </motion.span>
    );
  }

  return (
    <motion.span ref={ref} className="block">
      {text}
    </motion.span>
  );
}

/* ── Bento cards flip up in 3D, staggered ───────────────────────── */

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 56, rotateX: 14 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.9, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

export default function WhyKanbanSection() {
  /* Glow drifts as the section scrolls past */
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-b border-(--border)"
    >
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        {/* ── Kicker ────────────────────────────────────────────── */}
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/3 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-(--text-secondary) backdrop-blur-xl backdrop-saturate-150">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--brand) opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-(--brand)" />
              </span>
              <span>Why Kanban</span>
            </span>
          </div>
        </Reveal>

        {/* ── Heading + stats on one row ────────────────────────── */}
        <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <Reveal delay={0.08} className="max-w-2xl">
            <h2 className="font-mono text-3xl font-medium leading-[1.08] tracking-[-0.04em] text-(--text-primary) sm:text-4xl lg:text-5xl">
              Work should move{" "}
              <span className="bg-linear-to-b from-(--brand-hover) via-(--brand) to-(--brand-hover)/70 bg-clip-text text-transparent">
                forward.
              </span>
            </h2>
          </Reveal>

          {/* Stats — right-aligned horizontal strip, values count up */}
          <Reveal delay={0.16}>
            <div className="flex items-stretch gap-6 border-l border-white/6 pl-6 lg:gap-8 lg:pl-8">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`flex flex-col ${
                    i !== 0 ? "border-l border-white/6 pl-6 lg:pl-8" : ""
                  }`}
                >
                  <span className="font-mono text-lg font-medium tracking-tight text-(--text-primary) sm:text-xl">
                    <StatValue value={stat.value} />
                  </span>
                  <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-(--text-secondary)/60">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* ── Bento cards — flip up in 3D, one after another ─────── */}
        <div className="mt-16 perspective-distant">
          <motion.div
            className="grid gap-5 md:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{
              visible: { transition: { staggerChildren: 0.15 } },
            }}
          >
            {features.map((feature) => (
              <motion.div
                key={feature.number}
                variants={cardVariants}
                className="h-full"
              >
                <WhyCard {...feature} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
