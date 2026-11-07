import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface PageHeroProps {
  /** The small label above the title, in the mono register. */
  eyebrow: string;
  /** The title, split so the second half can sit in the quieter ink. */
  title: string;
  accentTitle?: string;
  lead: string;
  primary?: { label: string; to: string };
  secondary?: { label: string; to: string };
  children?: ReactNode;
}

/**
 * The opening band of a marketing page.
 *
 * Every page in this section opens the same way — one eyebrow, one headline at
 * the hero's size and tracking, one lead, one action — so the pages read as
 * chapters of one site rather than ten separate designs. The numbers are the
 * ones `HomeHero` was tuned to; change them here and every page follows.
 */
export default function PageHero({
  eyebrow,
  title,
  accentTitle,
  lead,
  primary,
  secondary,
  children,
}: PageHeroProps) {
  return (
    <section className="light-theme relative overflow-hidden bg-(--bg-root)">
      <div className="relative mx-auto w-full max-w-384 border-x border-(--hairline) px-4 pt-14 pb-10 sm:px-6 sm:pt-20 lg:px-8 lg:pb-24">
        <div className="mx-auto w-full max-w-3xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-(--text-secondary)/60">
            {eyebrow}
          </p>

          <h1 className="mt-5 font-sans text-[34px] font-bold leading-[1.12] tracking-[-1px] text-(--text-primary) sm:text-[40px] md:text-[44px] md:tracking-[-1.4px]">
            {title}
            {accentTitle ? (
              <>
                {" "}
                <span className="text-(--text-subtle)">{accentTitle}</span>
              </>
            ) : null}
          </h1>

          <p className="mt-4 max-w-125 text-[18px] leading-[1.4] tracking-[-0.3px] text-(--text-secondary) sm:text-[20px] md:text-[22px] md:tracking-[-0.5px]">
            {lead}
          </p>

          {(primary || secondary) && (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {primary ? (
                <Link to={primary.to} className="m-btn">
                  {primary.label}
                </Link>
              ) : null}

              {secondary ? (
                <Link to={secondary.to} className="m-btn-outline">
                  {secondary.label}
                </Link>
              ) : null}
            </div>
          )}

          {children}
        </div>
      </div>
    </section>
  );
}
