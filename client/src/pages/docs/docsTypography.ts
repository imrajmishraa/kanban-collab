/**
 * The docs type ramp, in one place.
 *
 * Every page uses these classes rather than its own strings, so a page added
 * later matches the ones already written without anyone comparing screenshots.
 * The values here are the ones the Introduction was tuned to — change a number
 * here and every page follows.
 *
 * Sizes are deliberately small for body copy. Reference documentation is read in
 * long stretches, and 16px with generous leading reads faster than 19px at the
 * same measure.
 */

/** Section heading. The hairline under it is what separates blocks. */
export const H2 =
  "mt-14 border-b border-(--hairline) pb-4 text-[30px] font-bold tracking-[-0.6px] text-(--text-primary)";

/** Sub-heading. No rule: it belongs to the h2 above it. */
export const H3 = "mt-8 text-[20px] font-semibold text-(--text-primary)";

/** Body copy. */
export const P = "mt-5 text-[16px] leading-[1.75] text-(--text-secondary)";

/** The opening paragraph, one step up from body copy. */
export const LEAD = "mt-8 text-[17px] leading-[1.75] text-(--text-secondary)";

/** Lists. A touch larger than body copy so the bullets do not look cramped. */
export const UL =
  "mt-4 list-disc space-y-2.5 pl-6 text-[17px] leading-[1.7] text-(--text-secondary)";

/** Pulled-out aside, indented behind a rule. */
export const QUOTE =
  "mt-8 border-l-2 border-(--hairline) pl-5 text-[19px] italic leading-[1.75] text-(--text-secondary)";

/** Links. Blue, not brand — blue is what a link looks like everywhere else. */
export const LINK =
  "text-blue-500 underline underline-offset-2 hover:text-blue-400";

/** Inline code, for a path, a command or a variable name. */
export const CODE =
  "rounded bg-(--tint-6) px-1.5 py-0.5 font-mono text-[15px] text-(--text-primary)";

/** A block of code or output. */
export const PRE =
  "mt-5 overflow-x-auto rounded-xl border border-(--hairline) bg-(--bg-surface) p-4 font-mono text-[14px] leading-[1.7] text-(--text-secondary)";

/** The breadcrumb above the page title. */
export const BREADCRUMB = "text-[14px] text-(--text-muted)";

/** The page title. */
export const H1 =
  "font-sans text-[34px] font-bold leading-[1.15] tracking-[-1px] sm:text-[40px] md:tracking-[-1.4px]";

/** A table of services, options or variables. */
export const TABLE_WRAP =
  "mt-5 overflow-x-auto rounded-xl border border-(--hairline)";
