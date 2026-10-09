import { motion, type Variants } from "framer-motion";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Tick02Icon,
  ArrowUp01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";

import { TiltCard } from "./Tilt";

type Visual = "board" | "cursors" | "velocity";

interface WhyCardProps {
  number: string;
  icon: IconSvgElement;
  title: string;
  description: string;
  visual: Visual;
}

/* ─────────────────────────────────────────────────────────────
   VISUAL 1 — Mini kanban board with a card mid-drag.
   The dragged card hovers and bobs forever; the drop target
   breathes under it.
   ───────────────────────────────────────────────────────────── */
function BoardVisual() {
  return (
    <div className="grid h-full grid-cols-3 gap-2 p-4">
      {/* Column 1 */}
      <div className="flex flex-col gap-1.5">
        <span className="mb-1 h-1 w-6 rounded-full bg-white/[0.14]" />
        <div className="rounded border border-white/[0.07] bg-white/3 p-2">
          <span className="block h-1 w-full rounded-full bg-white/18" />
          <span className="mt-1 block h-1 w-3/4 rounded-full bg-white/10" />
        </div>
        <div className="rounded border border-white/[0.07] bg-white/3 p-2">
          <span className="block h-1 w-2/3 rounded-full bg-white/[0.14]" />
        </div>
      </div>

      {/* Column 2 — active, with a card being dragged */}
      <div className="flex flex-col gap-1.5">
        <span className="mb-1 h-1 w-6 rounded-full bg-(--brand)/60" />

        {/* Drag target — breathes while the card hovers above it */}
        <motion.div
          className="rounded border border-dashed border-(--brand)/40 bg-(--brand)/4 p-2"
          animate={{ opacity: [0.55, 1, 0.55] }}
          transition={{
            duration: 2.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <span className="block h-1 w-4/5 rounded-full bg-(--brand)/30" />
        </motion.div>

        {/* The dragging card — permanently suspended mid-drag */}
        <motion.div
          className="relative rounded border border-(--brand)/40 bg-(--brand)/12 p-2 shadow-[0_4px_12px_-4px_var(--brand)]"
          animate={{ y: [0, -3, 0], rotate: [-2, -2.8, -2] }}
          transition={{
            duration: 2.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <span className="block h-1 w-full rounded-full bg-(--brand)/50" />
          <span className="mt-1 block h-1 w-2/3 rounded-full bg-(--brand)/25" />

          {/* Grab handle dots */}
          <span className="absolute -left-1 top-1/2 flex -translate-y-1/2 flex-col gap-0.5">
            <span className="h-0.5 w-0.5 rounded-full bg-(--brand)" />
            <span className="h-0.5 w-0.5 rounded-full bg-(--brand)" />
            <span className="h-0.5 w-0.5 rounded-full bg-(--brand)" />
          </span>
        </motion.div>
      </div>

      {/* Column 3 — done, faded */}
      <div className="flex flex-col gap-1.5">
        <span className="mb-1 h-1 w-6 rounded-full bg-white/10" />
        <div className="rounded border border-white/5 bg-white/2 p-2 opacity-60">
          <span className="block h-1 w-3/4 rounded-full bg-white/10" />
          <span className="mt-1 flex items-center gap-1">
            <span className="flex h-2 w-2 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-400">
              <HugeiconsIcon icon={Tick02Icon} size={5} />
            </span>
            <span className="block h-1 w-8 rounded-full bg-white/8" />
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   VISUAL 2 — Three collaborator cursors drifting over the board
   ───────────────────────────────────────────────────────────── */

function Cursor({
  name,
  color,
  textColor,
  className,
  path,
  duration,
}: {
  name: string;
  color: string;
  textColor: string;
  className: string;
  path: { x: number[]; y: number[] };
  duration: number;
}) {
  return (
    <motion.div
      className={`absolute flex items-start gap-1 ${className}`}
      animate={path}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
        <path
          d="M1 1L12 9L7 10L5 15L1 1Z"
          fill={color}
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className="rounded-[3px] px-1.5 py-0.5 font-mono text-[8px] font-medium leading-none shadow-[0_2px_6px_-1px_currentColor]"
        style={{ background: color, color: textColor }}
      >
        {name}
      </span>
    </motion.div>
  );
}

function CursorsVisual() {
  return (
    <div className="relative h-full overflow-hidden p-4">
      {/* Faint board shape behind */}
      <div className="absolute inset-4 grid grid-cols-2 gap-2 opacity-25">
        <div className="rounded border border-white/8 bg-white/2" />
        <div className="rounded border border-white/8 bg-white/2" />
      </div>

      {/* Cursor — Maya (brand) */}
      <Cursor
        name="Maya"
        color="var(--brand)"
        textColor="#FFFFFF"
        className="left-[22%] top-[34%]"
        path={{ x: [0, 26, -10, 0], y: [0, -14, 10, 0] }}
        duration={9}
      />

      {/* Cursor — Rio (cyan) */}
      <Cursor
        name="Rio"
        color="#38BDF8"
        textColor="#0A0A0A"
        className="left-[58%] top-[18%]"
        path={{ x: [0, -30, 14, 0], y: [0, 18, -8, 0] }}
        duration={12}
      />

      {/* Cursor — Sam (pink) */}
      <Cursor
        name="Sam"
        color="#F472B6"
        textColor="#0A0A0A"
        className="left-[38%] top-[62%]"
        path={{ x: [0, 20, -24, 0], y: [0, -18, 6, 0] }}
        duration={10}
      />

      {/* Live pulse dot top-right */}
      <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-white/8 bg-white/3 px-2 py-1 backdrop-blur-sm">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
        <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-(--text-secondary)/70">
          3 online
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   VISUAL 3 — Velocity bars grow from the baseline on view
   ───────────────────────────────────────────────────────────── */

const barsContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

const barVariant: Variants = {
  hidden: { scaleY: 0 },
  visible: {
    scaleY: 1,
    transition: { duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

function VelocityVisual() {
  const bars = [40, 55, 48, 72, 65, 88, 94];
  const maxBar = Math.max(...bars);

  return (
    <div className="flex h-full flex-col justify-end p-4">
      {/* Value + trend */}
      <div className="mb-3 flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-xl font-medium tracking-tight text-(--text-primary)">
            94
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-(--text-secondary)/60">
            pts / wk
          </span>
        </div>
        <motion.span
          initial={{ opacity: 0, scale: 0.8, y: 4 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            delay: 0.8,
            duration: 0.5,
            ease: [0.21, 0.47, 0.32, 0.98],
          }}
          className="flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-1.5 py-0.5 font-mono text-[9px] text-emerald-400"
        >
          <HugeiconsIcon icon={ArrowUp01Icon} size={8} />
          12%
        </motion.span>
      </div>

      {/* Bars */}
      <motion.div
        className="flex h-20 items-end gap-1.5"
        variants={barsContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
      >
        {bars.map((h, i) => {
          const isLast = i === bars.length - 1;
          const heightPct = (h / maxBar) * 100;
          return (
            <div
              key={i}
              className="relative flex-1 rounded-t-[3px]"
              style={{ height: `${heightPct}%` }}
            >
              <motion.div
                variants={barVariant}
                className={`absolute inset-0 origin-bottom rounded-t-[3px] ${
                  isLast
                    ? "bg-linear-to-t from-(--brand)/60 to-(--brand) shadow-[0_0_16px_-4px_var(--brand)]"
                    : "bg-white/8"
                }`}
              />
            </div>
          );
        })}
      </motion.div>

      {/* Baseline */}
      <div className="mt-2 flex justify-between font-mono text-[8px] uppercase tracking-[0.12em] text-(--text-secondary)/40">
        <span>W1</span>
        <span>W7</span>
      </div>
    </div>
  );
}

const visualMap: Record<Visual, () => React.ReactNode> = {
  board: BoardVisual,
  cursors: CursorsVisual,
  velocity: VelocityVisual,
};

/* ─────────────────────────────────────────────────────────────
   WhyCard — tilts with the cursor in 3D, glare included
   ───────────────────────────────────────────────────────────── */

export default function WhyCard({
  number,
  icon,
  title,
  description,
  visual,
}: WhyCardProps) {
  const Visual = visualMap[visual];

  return (
    <TiltCard intensity={6} className="h-full">
      <div
        className="
          group/card relative flex h-full flex-col overflow-hidden rounded-2xl
          border border-white/[0.07]
          bg-white/2
          backdrop-blur-xl backdrop-saturate-150
          shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]
          transition-all duration-500
          hover:border-white/[0.14]
          hover:bg-white/[0.035]
          hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_24px_56px_-24px_rgba(0,0,0,0.7)]
        "
      >
        {/* Top sheen */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.20)_50%,transparent)]"
        />

        {/* ── Visual stage ─────────────────────────────────────── */}
        <div className="relative h-48 overflow-hidden border-b border-white/5 bg-[#0B0B0F]">
          {/* Faint inner grid */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.5]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              maskImage:
                "radial-gradient(ellipse 80% 80% at 50% 50%, #000 0%, transparent 90%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 80% 80% at 50% 50%, #000 0%, transparent 90%)",
            }}
          />

          {/* The visual itself */}
          <div className="relative h-full">
            <Visual />
          </div>

          {/* Subtle fade from stage into body */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-[linear-gradient(to_top,rgba(11,11,15,0.9),transparent)]"
          />
        </div>

        {/* ── Content ──────────────────────────────────────────── */}
        <div className="relative flex flex-1 flex-col p-6">
          {/* Header — icon + number */}
          <div className="flex items-start justify-between">
            <span
              className="
                flex h-9 w-9 items-center justify-center rounded-[10px]
                border border-white/9
                bg-linear-to-b from-white/5 to-white/1
                text-(--brand)
                shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
                transition-all duration-500
                group-hover/card:border-(--brand)/40
                group-hover/card:text-(--brand-hover)
                group-hover/card:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_0_20px_-6px_var(--brand)]
              "
            >
              <HugeiconsIcon icon={icon} size={16} />
            </span>

            <span className="font-mono text-[10px] uppercase tracking-[0.3em] tabular-nums text-(--text-secondary)/45">
              {number}
            </span>
          </div>

          {/* Title + description */}
          <h3 className="mt-6 font-mono text-base font-medium tracking-[-0.01em] text-(--text-primary)">
            {title}
          </h3>

          <p className="mt-1.5 font-mono text-[12px] leading-[1.7] text-(--text-secondary)/85">
            {description}
          </p>

          {/* Footer link */}
          <div className="mt-auto flex items-center gap-2 pt-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-(--text-secondary)/55 transition-colors duration-500 group-hover/card:text-(--brand-hover)">
              Explore
            </span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/8 bg-white/2 text-(--text-secondary)/70 transition-all duration-500 group-hover/card:translate-x-0.5 group-hover/card:border-(--brand)/40 group-hover/card:bg-(--brand)/10 group-hover/card:text-(--brand-hover)">
              <HugeiconsIcon icon={ArrowRight01Icon} size={10} />
            </span>
          </div>
        </div>
      </div>
    </TiltCard>
  );
}
