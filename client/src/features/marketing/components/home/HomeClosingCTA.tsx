import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon, LayersIcon } from "@hugeicons/core-free-icons";

interface HomeClosingCTAProps {
  /**
   * Which theme this band is staged in. Defaults to `dark`, because a banner is
   * a poster: it should look the same for every visitor rather than inheriting
   * whatever the app is doing. Pass `light` or `inherit` to change that.
   */
  themeLock?: "dark" | "light" | "inherit";
}

/**
 * The closing banner: one sentence, one line under it, one link.
 *
 * The whole card is the link, not a card with a link inside it, so the target is
 * the largest thing on screen. The arrow moves on hover and on keyboard focus,
 * which is the only affordance saying the surface is clickable.
 *
 * The mark and the shine are a reward for pointing at the card: both are parked
 * at rest and start when the pointer arrives. They are decorative in the strict
 * sense, so they are `aria-hidden` and carry nothing the copy does not.
 */
export default function HomeClosingCTA({
  themeLock = "dark",
}: HomeClosingCTAProps) {
  const scope =
    themeLock === "dark"
      ? "dark-theme"
      : themeLock === "light"
        ? "light-theme"
        : "";

  return (
    <section
      className={["scroll-mt-16", scope, "bg-(--bg-root) text-(--text-primary)"]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mx-auto w-full max-w-384">
        <div>
          <a
            href="/auth/register"
            className="group relative block overflow-hidden border-r border-l border-(--hairline) bg-(--bg-root) transition-colors duration-200 hover:border-(--hairline-strong) motion-reduce:transition-none"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-8 -bottom-6 top-8 rounded-[40%] hover:bg-transparent bg-(--brand)/10 blur-[100px]"
            />
            {/* Everything that animates lives in here, and the whole layer is
                hidden until the card is pointed at. The animations themselves
                are also parked while hidden (see `.cta-mark` and `.cta-shine` in
                index.css), so nothing is running behind a hidden layer. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-8 -bottom-6 top-8 rounded-[40%] bg-(--brand)/15 blur-[100px]"
              />
              <div className="absolute inset-0 mask-[linear-gradient(to_right,transparent_0%,transparent_30%,black_58%,black_100%)]">
                {/* Held at 45% from the left. The wrapper owns the position and
                    the vertical centring, so the icon is free to own the
                    transform: an animation on `transform` would overwrite any
                    translate the same element was using to place itself. */}
                <div className="absolute inset-y-0 left-[45%] flex items-center">
                  <HugeiconsIcon
                    icon={LayersIcon}
                    size={440}
                    strokeWidth={1.8}
                    className="cta-mark rotate-45 text-(--text-solid)"
                  />
                </div>
              </div>

              {/* The shine: a soft band that crosses left to right, once per
                  cycle, then waits off the edge. */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="cta-shine absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-transparent via-(--brand)/20 to-transparent blur-2xl" />
              </div>

              {/* The wash that keeps the copy legible under it. */}
              <div className="absolute inset-0 bg-linear-to-r from-(--bg-root) via-(--bg-root)/85 to-transparent" />
              <div className="absolute inset-x-0 top-0 h-px bg-(--hairline)" />
            </div>

            <div className="relative z-10 px-4 py-10 sm:px-8 sm:py-12 md:px-12 md:py-16 lg:px-16 lg:py-20">
              <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-(--text-primary) md:text-4xl">
                Let us handle{" "}
                <span className="text-(--text-muted)"> the board</span>
              </h2>
              <p className="mt-6 max-w-2xl text-xl font-light leading-relaxed text-(--text-secondary)">
                Every card, column and comment synced the moment anyone moves
                something. Start with one board and invite the rest of the team
                when it earns its place.
              </p>

              <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-(--text-primary)">
                <span>Start a board</span>
                <HugeiconsIcon
                  icon={ArrowUpRight01Icon}
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-focus-visible:translate-x-0.5 group-focus-visible:-translate-y-0.5 motion-reduce:transition-none"
                />
              </span>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
