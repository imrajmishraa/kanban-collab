import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

interface StepSectionProps {
  id: string;
  /**
   * The two-digit index, in the mono register. Optional so a caller that does
   * not want the eyebrow can leave it out; the six steps pass it.
   */
  title: string;
  body: string;
  primary: { label: string; to: string };
  secondary: { label: string; to: string };
  /** The mark drawn large on the graph paper. */
  glyph: IconSvgElement;
  /** Twenty-five marks for the sample grid. */
  icons: IconSvgElement[];
  children?: ReactNode;
}

/** The paper the hero glyph sits on: a 16px grid, one hairline per line. */
const GRAPH_PAPER = {
  backgroundImage:
    "linear-gradient(to right, var(--hairline) 1px, transparent 1px), linear-gradient(to bottom, var(--hairline) 1px, transparent 1px)",
  backgroundSize: "16px 16px",
} as const;

/**
 * One step of the tour, in the shape the reference page uses for a style: a
 * heading, a paragraph, two actions, then the evidence — the mark drawn large on
 * graph paper, beside a grid of the marks it is drawn from.
 *
 * The evidence is what makes this a tour rather than a feature list: you see the
 * thing before you read a claim about it.
 *
 * The frame is `max-w-7xl` and the text sits in its own narrower measure inside
 * it, so the panels can take the full width while the paragraph stays readable.
 * Putting the panels inside the text measure is what kept them at ~420px each.
 */
export default function StepSection({
  id,
  title,
  body,
  primary,
  secondary,
  glyph,
  icons,
  children,
}: StepSectionProps) {
  return (
    <section
      id={id}
      className="relative scroll-mt-24 border-b border-(--hairline) bg-(--bg-hover)/40"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <h2 className="mt-4 font-sans text-[30px] font-bold leading-[1.15] tracking-[-1.2px] text-(--text-primary) sm:text-[36px] md:text-[40px]">
          {title}
        </h2>

        <p className="mt-8 max-w-225 text-[15px] leading-[1.7] text-(--text-secondary) sm:text-[17px]">
          {body}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link to={primary.to} className="m-btn">
            {primary.label}
          </Link>
          <Link to={secondary.to} className="m-btn-outline">
            {secondary.label}
          </Link>
        </div>

        <div className="mt-10 grid max-w-full grid-cols-1 gap-6 sm:grid-cols-2">
          {/* the mark, on paper */}
          <div className="grid aspect-380/376 place-items-center overflow-hidden rounded-2xl border border-(--hairline) bg-(--bg-surface)">
            <div
              className="grid size-full place-items-center"
              style={GRAPH_PAPER}
            >
              <HugeiconsIcon
                icon={glyph}
                size={160}
                strokeWidth={1.1}
                aria-hidden="true"
                className="text-(--text-primary)"
              />
            </div>
          </div>

          {/* the family it belongs to */}
          <div className="overflow-hidden rounded-2xl border border-(--hairline) bg-(--bg-surface) p-3">
            <div className="grid h-full grid-cols-5 gap-px overflow-hidden rounded-lg bg-(--hairline)">
              {icons.slice(0, 25).map((icon, position) => (
                <div
                  key={position}
                  className="grid aspect-square place-items-center bg-(--bg-surface)"
                >
                  <HugeiconsIcon
                    icon={icon}
                    size={26}
                    strokeWidth={1.6}
                    aria-hidden="true"
                    className="text-(--text-secondary)"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {children}
      </div>
    </section>
  );
}
