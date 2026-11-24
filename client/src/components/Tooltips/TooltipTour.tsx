import { useRef, useState, type RefObject } from "react";

import { Tooltip } from "@/components/Tooltips/ToolTip";
import { announce } from "@/lib/announce";

/**
 * An onboarding sequence: one bubble at a time, with a way forward and a way out.
 *
 * A tour is not a tooltip with a counter — it is a state machine over anchors. This keeps the
 * state here and uses a normal `Tooltip` for each step, so the bubble looks like every other
 * bubble and the reader is never taught two visual languages.
 */
export interface TourStep {
  /** What the step points at. */
  target: RefObject<HTMLElement | null>;
  label: string;
  description?: string;
}

export function TooltipTour({
  steps,
  onDone,
  side = "bottom",
}: {
  steps: TourStep[];
  onDone?: () => void;
  side?: "top" | "bottom" | "left" | "right";
}) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(true);
  /* The anchor changes per step, so the wrapper is re-created with a new ref each time. */
  const anchor = useRef<HTMLSpanElement>(null);

  const step = steps[index];
  if (!step || !open) return null;

  const finish = () => {
    setOpen(false);
    onDone?.();
  };

  const next = () => {
    if (index + 1 >= steps.length) {
      announce("Tour finished");
      finish();
      return;
    }
    const upcoming = steps[index + 1];
    announce(`Step ${index + 2} of ${steps.length}: ${upcoming.label}`);
    setIndex(index + 1);
  };

  const back = () => {
    if (index === 0) return;
    announce(`Step ${index}: ${steps[index - 1].label}`);
    setIndex(index - 1);
  };

  return (
    <Tooltip
      label={step.label}
      description={step.description}
      placement={side}
      trigger="manual"
      open
      interactive
      actions={
        <>
          <button
            type="button"
            onClick={back}
            disabled={index === 0}
            className="rounded border border-current/25 px-1.5 py-0.5 text-[10px] uppercase tracking-wide opacity-80 disabled:opacity-30"
          >
            back
          </button>
          <button
            type="button"
            onClick={next}
            className="rounded border border-current/25 px-1.5 py-0.5 text-[10px] uppercase tracking-wide opacity-80"
          >
            {index + 1 === steps.length ? "done" : "next"}
          </button>
          <span className="ml-1 text-[10px] opacity-60">
            {index + 1}/{steps.length}
          </span>
        </>
      }
    >
      <span
        ref={anchor}
        aria-hidden
        className="pointer-events-none fixed"
        style={anchorStyle(step.target)}
      />
    </Tooltip>
  );
}

/** The bubble anchors to a zero-size marker placed over the step's real target. */
function anchorStyle(target: RefObject<HTMLElement | null>) {
  const rect = target.current?.getBoundingClientRect();
  if (!rect) return { top: -9999, left: -9999 };

  return {
    top: rect.top + rect.height / 2,
    left: rect.left + rect.width / 2,
  };
}
