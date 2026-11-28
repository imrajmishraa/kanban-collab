/**
 * The marketing motion layer's clock, its curves, and the ten principles it
 * spends them on.
 *
 * DESIGN.md owns the timing: 150ms for colour and hover, 200ms for layout,
 * 300ms for menus, and "nothing scales on entry". Nothing here goes past those
 * limits — the principles below are the vocabulary for spending them, not a
 * licence to go slower or bigger.
 *
 * Pure on purpose: no React and no framer-motion, so the arithmetic is tested
 * on its own in `motionTokens.test.ts`.
 */

export const DURATION = {
  /** Colour, hover, focus — DESIGN.md's 150ms. */
  fast: 0.15,
  /** Layout shifts and widths. */
  base: 0.2,
  /** Menus and popovers. */
  slow: 0.3,
  /** One section arriving on scroll: longer than a control, because it is read
   *  once and never holds up an interaction. */
  reveal: 0.7,
  /** The beat a demo holds on its payoff before it loops. */
  hold: 1.4,
} as const;

export const EASE = {
  /** Decelerate into place. */
  out: [0.22, 1, 0.36, 1] as [number, number, number, number],
  inOut: [0.6, 0, 0.4, 1] as [number, number, number, number],
  /** The curve HomeHero already uses, so new sections match the hero. */
  reveal: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number],
};

/** Spring for anything that should overshoot and settle: a release, a drop, a
 *  neighbour making room. Damped enough that it settles inside ~320ms. */
export const SETTLE = {
  type: "spring" as const,
  stiffness: 320,
  damping: 22,
  mass: 0.6,
};

export type PrincipleId =
  | "squash-stretch"
  | "anticipation"
  | "staging"
  | "pose-to-pose"
  | "follow-through"
  | "slow-in-slow-out"
  | "arcs"
  | "secondary-action"
  | "snappy-timing"
  | "exaggerated-feedback";

export interface Principle {
  id: PrincipleId;
  name: string;
  /** The surface that spends it, so "we used it" has somewhere to point. */
  where: string;
  /** The rule, with the number that makes it true. */
  rule: string;
}

/**
 * The ten principles, each mapped to one place it is used. A principle with no
 * `where` would be decoration; this list is the audit trail.
 */
export const PRINCIPLES: readonly Principle[] = [
  {
    id: "squash-stretch",
    name: "Squash & stretch",
    where: "Press (every marketing call to action)",
    rule: "The press dips to 0.97 and springs back through 1.015. Never on entry: DESIGN.md forbids scaled text.",
  },
  {
    id: "anticipation",
    name: "Anticipation / wind-up",
    where: "BoardDragDemo, Press",
    rule: "90ms of cursor press before a card lifts; a 3% dip before a button commits.",
  },
  {
    id: "staging",
    name: "Staging the focus",
    where: "Stagger + Rise, StepSection",
    rule: "One focal object per band; its siblings follow 60ms apart and never move first.",
  },
  {
    id: "pose-to-pose",
    name: "Pose to pose",
    where: "Rise, BoardDragDemo",
    rule: "Two named poses per interaction (hidden → shown, picked → dropped) keyed from one variant set, 60ms apart, never frame-by-frame tweens.",
  },
  {
    id: "follow-through",
    name: "Follow through",
    where: "SETTLE spring, BoardDragDemo columns",
    rule: "Releases overshoot and settle on a spring; a column's remaining cards close the gap 200ms after the card leaves.",
  },
  {
    id: "slow-in-slow-out",
    name: "Slow in, slow out",
    where: "EASE.out / EASE.reveal",
    rule: "Reveals run 0.7s on a decelerating curve; presses run 90ms in, 320ms out.",
  },
  {
    id: "arcs",
    name: "Moving in arcs",
    where: "Rise, BoardDragDemo travel",
    rule: "Items enter on a shallow arc (8px) and a dragged card lifts 14px at the midpoint, never a straight line.",
  },
  {
    id: "secondary-action",
    name: "Secondary action",
    where: "BoardDragDemo count roll and toast",
    rule: "The column count rolls 140ms after the card lands; the toast confirms 140ms after that.",
  },
  {
    id: "snappy-timing",
    name: "Snappy timing",
    where: "DURATION.fast / DURATION.base",
    rule: "Interactive feedback is 150–200ms. Nothing a reader waits on is stretched past 300ms.",
  },
  {
    id: "exaggerated-feedback",
    name: "Exaggerated feedback",
    where: "Press, BoardDragDemo lift",
    rule: "Capped at 1.5% scale on a control and 2% on a lifted card: read as a reaction, not a jump.",
  },
];

export const PRINCIPLE_IDS: readonly PrincipleId[] = PRINCIPLES.map(
  (principle) => principle.id,
);

/**
 * The delay before sibling `index` moves. Capped, because a long list must not
 * make the last card wait: 25 siblings would otherwise take 1.5s.
 */
export function staggerDelay(index: number, step = 0.06, cap = 0.36): number {
  if (!Number.isFinite(index) || index <= 0) return 0;
  return Math.min(index * step, cap);
}

/**
 * Where sibling `position` of `count` starts from, on an arc: the ends drop
 * furthest and the middle rises least, so a row arrives along a curve rather
 * than a line. Bounded by `radius` in both axes.
 */
export function arcOffset(
  position: number,
  count: number,
  radius = 8,
): { x: number; y: number } {
  if (count <= 1) return { x: 0, y: radius };
  const t = (position / (count - 1)) * 2 - 1;
  return {
    x: round(radius * t),
    y: round(radius * t * t),
  };
}

/** The scale a control passes through on a press: rest, down, release, settle. */
export function pressFrames(
  dip = 0.97,
  overshoot = 0.015,
): { rest: number; down: number; release: number; settle: number } {
  return { rest: 1, down: dip, release: round(1 + overshoot), settle: 1 };
}

/**
 * Three keyframes for a move that arcs: start, a lifted midpoint, end. The
 * midpoint is above both ends whichever way the move runs.
 */
export function arcKeyframes(
  from: number,
  to: number,
  lift = 14,
): [number, number, number] {
  return [from, round(Math.min(from, to) - lift), to];
}

/** Seconds, or nothing at all when the reader asked for reduced motion. */
export function resolveDuration(seconds: number, reduced: boolean | null) {
  return reduced ? 0 : seconds;
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}
