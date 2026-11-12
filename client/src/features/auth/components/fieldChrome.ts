/**
 * The field chrome, shared by every auth input.
 *
 * These four strings used to live inside `LoginForm`. `RegisterForm` needs the
 * same ones — same height, same mark, same padding that follows the mark — and
 * a second copy is exactly how two forms end up with two field heights and two
 * focus rings. One copy, imported by both.
 *
 * Every class here depends on the input being a `peer` and on the mark and the
 * clear button coming *after* it in the DOM. Moving either before the input
 * silently kills the `peer-*` variants — see the gotchas in the auth memo.
 */

/** Height, radius, border, ink, and the focus transition. */
export const FIELD = [
  "h-12 w-full rounded-xl border bg-(--bg-surface) pr-4",
  "text-[15px] text-(--text-primary) placeholder:text-(--text-subtle)",
  "outline-hidden transition-colors duration-150",
  "hover:border-(--hairline-strong) focus:border-(--brand) focus:bg-(--tint-2)",
].join(" ");

/** The mark at the left edge of a field. */
export const MARK =
  "pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-(--text-subtle) opacity-0 transition-[opacity,color] duration-150 peer-focus:opacity-100 peer-focus:text-(--brand) peer-not-placeholder-shown:opacity-100";

/** Padding follows the mark: reserved while it shows, plain while it does not. */
export const PAD = "pl-4 focus:pl-11 [&:not(:placeholder-shown)]:pl-11";

/** The clear button: only while there is something to clear. */
export const CLEAR =
  "absolute top-1/2 hidden size-6 -translate-y-1/2 place-items-center rounded-md text-(--text-subtle) transition-colors duration-150 peer-not-placeholder-shown:grid hover:bg-(--tint-4) hover:text-(--text-primary)";
