import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface StaggerProps {
  children: ReactNode;
  className?: string;
  /** Seconds between siblings. 60ms reads as one gesture, not a queue. */
  step?: number;
  delay?: number;
}

/**
 * The container half of a staged entrance: it has no motion of its own, it only
 * decides when its `Rise` children go. Staging is the point — one band arrives
 * as one gesture, with the eye's first stop 60ms ahead of the rest.
 *
 * Reduced motion is handled once, at the root `MotionConfig`: transforms are
 * dropped and only the opacity step remains.
 */
export default function Stagger({
  children,
  className,
  step = 0.06,
  delay = 0.04,
}: StaggerProps) {
  const container: Variants = {
    hidden: {},
    shown: { transition: { staggerChildren: step, delayChildren: delay } },
  };

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-70px" }}
    >
      {children}
    </motion.div>
  );
}
