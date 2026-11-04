import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";

import HeroPreview from "./HeroPreview";

/* ── Entrance choreography ──────────────────────────────────────────── */

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

/* ── Copy ───────────────────────────────────────────────────────────── */

const PROOF_MARKS = ["React", "TypeScript", "Yjs", "Tailwind", "MongoDB"];

/* ── Hero ───────────────────────────────────────────────────────────── */

export default function HeroSection() {
  /* Gentle drift only: the preview never fades out on scroll. */
  const { scrollY } = useScroll();
  const yCard = useTransform(scrollY, [0, 900], [0, -40]);

  return (
    /* Locked to the light palette for the whole subtree: the headline, the CTA,
       the proof row, the preview box and its slides all resolve their tokens
       here, whatever the page or the app theme is doing. */
    <section className="light min-h-full relative overflow-hidden bg-(--bg-root)">
      <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-14 sm:px-6 sm:pt-20 lg:px-8 lg:pb-16">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-8 xl:gap-0"
        >
          {/* ── Left: the pitch ──────────────────────────────────── */}
          <div className="mx-auto w-full max-w-125 lg:mx-0">
            <motion.h1
              variants={item}
              className="font-sans text-[34px] font-bold leading-[1.12] tracking-[-1px] text-(--text-primary) sm:text-[40px] md:text-[44px] md:tracking-[-1.4px]"
            >
              Kanban boards{" "}
              <span className="text-(--text-muted)">
                that keep your team moving.
              </span>
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-4 max-w-125 text-[18px] leading-[1.4] tracking-[-0.3px] text-(--text-secondary) sm:text-[20px] md:text-[22px] md:tracking-[-0.5px]"
            >
              Real-time boards. Everything you need to turn scattered ideas into
              shipped work, together.
            </motion.p>

            <motion.div variants={item} className="mt-8">
              <Link
                to="/workspaces"
                className="
                  inline-flex h-11 items-center justify-center rounded-lg px-4
                  border border-(--brand) bg-(--brand)/80
                  font-sans text-[14px] font-bold text-(--solid-text)
                  transition-colors duration-200 motion-reduce:transition-none
                  hover:border-(--brand-hover) hover:bg-(--brand)/85
                  focus-visible:ring-2 focus-visible:ring-(--brand) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-root) focus-visible:outline-none
                "
              >
                Explore a live board
              </Link>
            </motion.div>

            {/* Proof */}
            <motion.div variants={item} className="mt-10 sm:mt-12">
              <p className="text-[16px] tracking-[-0.5px] text-(--text-secondary)">
                Open source, built with
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
                {PROOF_MARKS.map((mark) => (
                  <span
                    key={mark}
                    className="font-sans text-[17px] font-bold tracking-tight text-(--text-subtle) transition-colors duration-200 hover:text-(--text-muted) motion-reduce:transition-none"
                  >
                    {mark}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Right: the preview box ───────────────────────────── */}
          <div id="demo" className="w-full lg:pl-5 xl:pl-12">
            <motion.div variants={item}>
              {/* Drift lives on its own layer: a variant and a scroll
                  MotionValue cannot both drive `y`. */}
              <motion.div style={{ y: yCard }}>
                <HeroPreview />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
