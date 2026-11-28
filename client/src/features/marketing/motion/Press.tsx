import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { pressFrames, SETTLE } from "./motionTokens";

interface PressProps {
  children: ReactNode;
  className?: string;
}

/**
 * A press with a wind-up: the control dips 3% on the down beat, springs back
 * through 1.5% on release, and the spring settles it. The wrapper is a plain
 * inline-flex box, so it never changes the control's own layout, colour or
 * focus ring — the control keeps its `.m-btn` styling and its keyboard path.
 *
 * `whileTap` is pointer and keyboard both: framer treats Enter and Space on a
 * button as a tap, so the feedback is not mouse-only.
 */
export function Press({ children, className }: PressProps) {
  const reduced = useReducedMotion();
  const frames = pressFrames();

  if (reduced)
    return <span className={cn("inline-flex", className)}>{children}</span>;

  return (
    <motion.span
      className={cn("inline-flex", className)}
      whileHover={{ scale: frames.release }}
      whileTap={{ scale: frames.down }}
      transition={SETTLE}
    >
      {children}
    </motion.span>
  );
}
