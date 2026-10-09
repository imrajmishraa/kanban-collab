import { useRef, type MouseEvent, type ReactNode } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { cn } from "#lib/utils";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Max degrees of rotation on mouse move. */
  intensity?: number;
  /** Resting tilt (degrees) so the surface sits back in 3D space. */
  restX?: number;
  restY?: number;
  /** Radial highlight that follows the cursor. */
  glare?: boolean;
}

export function TiltCard({
  children,
  className,
  intensity = 8,
  restX = 0,
  restY = 0,
  glare = true,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  const spring = { stiffness: 140, damping: 16, mass: 0.4 };

  const rotateX = useSpring(
    useTransform(my, [0, 1], [intensity + restX, -intensity + restX]),
    spring,
  );
  const rotateY = useSpring(
    useTransform(mx, [0, 1], [-intensity + restY, intensity + restY]),
    spring,
  );

  const glareX = useTransform(mx, (v) => v * 100);
  const glareY = useTransform(my, (v) => v * 100);
  const glareBg = useMotionTemplate`radial-gradient(420px circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.09), transparent 65%)`;

  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((event.clientX - rect.left) / rect.width);
    my.set((event.clientY - rect.top) / rect.height);
  };

  const handleLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={cn("perspective-1400px", className)}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative h-full w-full"
      >
        {children}
        {glare && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit]"
            style={{ background: glareBg }}
          />
        )}
      </motion.div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
   Reveal — blur-in + rise on scroll into view.
   ──────────────────────────────────────────────────────────────────── */

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}

export function Reveal({
  children,
  className,
  delay = 0,
  y = 32,
}: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.9,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────────────
   SectionHeading — the shared eyebrow / title / description block.
   ──────────────────────────────────────────────────────────────────── */

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  description?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <Reveal>
        <div className="inline-flex items-center gap-2.5 rounded-full border border-white/8 bg-white/3 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-(--text-secondary) shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl backdrop-saturate-150">
          <span className="h-1.5 w-1.5 rounded-full bg-(--brand) shadow-[0_0_8px_var(--brand)]" />
          {eyebrow}
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <h2 className="mt-6 font-mono text-3xl font-medium tracking-tighter text-(--text-primary) sm:text-4xl md:text-[2.75rem] md:leading-[1.05]">
          {title}
        </h2>
      </Reveal>

      {description && (
        <Reveal delay={0.16}>
          <p className="mx-auto mt-5 max-w-lg font-mono text-sm leading-[1.9] text-(--text-secondary)">
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
