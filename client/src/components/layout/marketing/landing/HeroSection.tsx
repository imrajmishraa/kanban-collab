import { Link } from "react-router-dom";
import { lazy } from "react";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";

import { useMediaQuery } from "./useMediaQuery";
import DesktopFrame from "./screen/DesktopFrame";

const DashboardDemoPage = lazy(
  () => import("@/components/layout/marketing/landing/DashboardDemoPage"),
);
/* ── Entrance choreography ──────────────────────────────────────────── */

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 32, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

/* Headline lines flip up from a 3D hinge */
const line: Variants = {
  hidden: { opacity: 0, y: 60, rotateX: 45 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 1.1, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

export default function HeroSection() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  /* Gentle drift only — no fading, the board never turns invisible */
  const { scrollY } = useScroll();
  const yBoard = useTransform(scrollY, [0, 900], [0, -40]);
  const yGlow = useTransform(scrollY, [0, 900], [0, 60]);

  return (
    <section className="relative overflow-hidden bg-transparent">
      <div className="relative mx-auto max-w-7xl px-4 pb-20 pl-20 pt-24 sm:px-6 sm:pt-28 lg:max-w-400 lg:px-8 lg:pb-28 lg:pt-32">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="grid items-center gap-14 lg:grid-cols-[1fr_auto] lg:gap-12"
        >
          {/* ── Left: the pitch ──────────────────────────────────── */}
          <div className=" mx-auto max-w-2xl text-centre">
            {/* Eyebrow */}
            <motion.div variants={item}>
              <div
                className="
                  eyebrow-orbit
                  mb-10 inline-flex items-center gap-2.5
                  rounded-full
                  bg-[#0B0B10]/70
                  px-4 py-2
                  font-mono text-[10px] uppercase tracking-[0.22em]
                  text-(--text-secondary)
                  shadow-[0_4px_20px_-8px_rgba(0,0,0,0.6)]
                  backdrop-blur-xl backdrop-saturate-150
                "
              >
                <span className="eyebrow-ring" aria-hidden="true" />

                <span className="relative z-2 flex items-center gap-2.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--success) opacity-70" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-(--success)" />
                  </span>
                  <span>Real-time collaboration</span>
                </span>
              </div>
            </motion.div>

            {/* Heading — lines hinge up in 3D */}
            <motion.h1
              className="font-mono text-[2.5rem] font-medium leading-[1.02] tracking-tighter text-(--text-primary) sm:text-5xl md:text-6xl lg:text-[3.25rem]"
              style={{ transformStyle: "preserve-3d" }}
            >
              <span className="block perspective-midrange">
                <motion.span variants={line} className="block">
                  Build.
                </motion.span>
              </span>
              <span className="block perspective-midrange">
                <motion.span
                  variants={line}
                  className="block bg-linear-to-b from-(--brand-hover) via-(--brand) to-(--brand-hover)/70 bg-clip-text text-transparent"
                >
                  Organize.
                </motion.span>
              </span>
              <span className="block perspective-midrange">
                <motion.span
                  variants={line}
                  className="block text-(--text-primary)/85"
                >
                  Collaborate.
                </motion.span>
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={item}
              className="mx-auto mt-8 max-w-lg font-mono text-sm leading-[1.9] text-(--text-secondary) sm:text-[15px] lg:mx-0 text-center"
            >
              A real-time Kanban workspace for teams that want to turn ideas
              into progress — together.
            </motion.p>

            {/* Actions */}
            <motion.div
              variants={item}
              className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
            >
              <Link
                to="/dashboard"
                className="
                  group/cta relative inline-flex min-w-44 items-center justify-center gap-2
                  overflow-hidden rounded-full
                  border border-(--brand)/45
                  bg-(--brand)/12
                  px-6 py-3
                  font-mono text-sm text-(--brand-hover)
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]
                  backdrop-blur-xl backdrop-saturate-150
                  transition-all duration-300
                  hover:border-(--brand)/80
                  hover:bg-(--brand)/20
                  hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]
                  active:scale-[0.98]
                "
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)] transition-transform duration-700 group-hover/cta:translate-x-full" />
                <span className="relative">Get Started</span>
                <span className="relative transition-transform duration-300 group-hover/cta:translate-x-0.5">
                  →
                </span>
              </Link>

              <motion.a
                href="#demo"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="
                  inline-flex min-w-44 items-center justify-center gap-2
                  rounded-full
                  border border-white/10
                  bg-white/3
                  px-6 py-3
                  font-mono text-sm text-(--text-secondary)
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
                  backdrop-blur-xl backdrop-saturate-150
                  transition-colors duration-300
                  hover:border-white/20
                  hover:bg-white/6
                  hover:text-(--text-primary)
                "
              >
                <span>View Demo</span>
              </motion.a>
            </motion.div>

            {/* Trust line */}
            <motion.p
              variants={item}
              className="mt-8 font-mono text-[10px] uppercase tracking-[0.28em] text-(--text-secondary)/50"
            >
              No setup · Open source · Instant sync
            </motion.p>
          </div>

          {/* ── Right: the board — bigger, beside the pitch ──────── */}
          <motion.div
            id="demo"
            style={{ y: yBoard }}
            className="relative mx-auto w-full max-w-180 lg:mx-0 lg:max-w-280 lg:pr-6"
          >
            <motion.div
              aria-hidden
              style={{ y: yGlow }}
              className="pointer-events-none absolute -inset-x-10 -inset-y-12 rounded-[40%] bg-(--brand)/10 blur-[110px]"
            />

            {isDesktop ? (
              <DesktopFrame
                title="Kanban Collab"
                url="kanban.app"
                screenAspect="aspect-4/3"
              >
                <DashboardDemoPage />
              </DesktopFrame>
            ) : null}

            <div
              aria-hidden
              className="pointer-events-none mx-auto mt-3 h-8 w-4/5 rounded-[50%] bg-white/2.5 blur-3xl"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
