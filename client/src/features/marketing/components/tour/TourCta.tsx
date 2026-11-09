import { Link } from "react-router-dom";

/** The stack, as a quiet row of wordmarks under the ask. */
const STACK = [
  "React",
  "TypeScript",
  "Node",
  "MongoDB",
  "Redis",
  "Yjs",
  "Docker",
];

/**
 * The closing band.
 *
 * Staged dark on purpose: six light sections in a row and the last one needs to
 * read as an ending. The second line sits in the muted ink so the sentence
 * lands as one thought rather than two headings, and the button is the only
 * bright thing on the band.
 */
export default function TourCta() {
  return (
    <section className="light-theme relative overflow-hidden bg-(--bg-root)">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(760px 420px at 50% 0%, color-mix(in srgb, var(--brand) 22%, transparent), transparent 72%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-384 px-4 py-20 text-center sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <h2 className="mx-auto max-w-180 font-sans text-[30px] font-bold leading-[1.15] tracking-[-1.2px] text-(--text-primary) sm:text-[34px]">
          Six steps, and the board is yours.
          <br />
          <span className="text-(--text-muted)">Start with the first one.</span>
        </h2>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/workspaces" className="m-btn">
            Open a live board
          </Link>
          <Link to="/pricing" className="m-btn-outline">
            See what it costs
          </Link>
        </div>

        <div className="mt-15 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {STACK.map((name) => (
            <span
              key={name}
              className="font-sans text-[10px] uppercase tracking-[0.18em] text-(--text-muted)"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
