import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

import { arcOffset, DURATION, EASE } from "./motionTokens";

interface RiseProps {
  children: ReactNode;
  className?: string;
  /** Position in the group, for the arc. */
  index?: number;
  /** Size of the group, for the arc. */
  count?: number;
  /** How far below its slot the item starts. */
  y?: number;
  /** How far the arc bows at the ends. */
  radius?: number;
}

/**
 * One item of a staged entrance. Must sit inside `Stagger` — the parent owns
 * the timing, this owns the path: up and slightly outward along a shallow arc,
 * so a row reads as one object arriving rather than several boxes appearing.
 */
export function Rise({
  children,
  className,
  index = 0,
  count = 1,
  y = 14,
  radius = 8,
}: RiseProps) {
  const { x } = arcOffset(index, count, radius);

  const item: Variants = {
    hidden: { opacity: 0, y, x },
    shown: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: { duration: DURATION.reveal, ease: EASE.reveal },
    },
  };

  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}
